import { readFile } from 'node:fs/promises'

import { BaseResponseResources } from 'aidbox'
import { Patient, Practitioner, Appointment, Encounter } from 'aidbox/types'
import { FastifyReply } from 'fastify/types/reply'
import { FastifyRequest } from 'fastify/types/request'
import twilio from 'twilio'

import { getIn } from '../../utils/index.js'
import {
  transformAppointmentCreateDataToEncounter, transformAppointmentData
} from '../../utils/transform.js'

const AccessToken = twilio.jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant

interface User {
  data: { firstEntry: boolean, verified: boolean, roleName: 'patient' | 'practitioner' | 'admin' },
  name: { givenName: string, familyName: string },
  email: string,
  password: string,
  id: string,
  link: Array<{ link: { id: string, resourceType: 'Patient' | 'Practitioner', display?: string } }>
  resourceType: 'User'
}

export type AppointmentData = {
  patient: string
  practitioner: string
  start: string
  end: string
  chief: string
}

export const endpoints = [
  {
    path: '/EmailNotification/$check-mail',
    method: 'get',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{
        Params: { id: string };
      }>,
      reply: FastifyReply
    ) => {
      const { mailgunClient, aidboxClient } = request
      const mailsMG = (await mailgunClient.getStats()).data.items
      const mailsDB = await aidboxClient.rawSQL<any>(
        "SELECT * FROM emailNotification WHERE resource->>'status'='accepted'"
      )

      mailsMG.forEach((mailMG: any) => {
        const sameMessage = mailsDB.find((mailDB: any) =>
          (mailDB.resource.externalId || []).includes(
            mailMG.message.headers['message-id']
          )
        )

        if (sameMessage && sameMessage.resource.status !== mailMG.event) {
          aidboxClient
            .getHttpClient()
            .patch(`EmailNotification/${sameMessage.id}`, {
              json: {
                status: mailMG.event
              }
            })
        }
      })

      return reply.send({
        status: true
      })
    }
  },
  {
    path: '/node-app-git-commit-hash',
    method: 'get',
    authRequired: false,
    handler: async (request: FastifyRequest<any>, reply: FastifyReply) => {
      try {
        const gitHash = (await readFile('git-hash')).toString()
        return reply.send(gitHash)
      } catch (e) {
        return reply.send('')
      }
    }
  },
  {
    path: '/$create-user',
    method: 'post',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{ Body: { data: { resource: Patient | Practitioner, user: User } } }>,
      reply: FastifyReply
    ) => {
      const { aidboxClient, body: { data } } = request

      if (!data.user.email || !data.user.password) { return reply.status(400).send({ error: { message: 'Empty data' } }) }

      const existUser = await aidboxClient
        .getHttpClient()
        .get(`User?.email=${data.user.email}`)
        .json<BaseResponseResources<'User'>>()

      if (existUser.entry?.length) {
        return reply
          .status(400)
          .send({ error: { message: 'Email already taken' } })
      }

      const { id, resourceType } = await aidboxClient
        .resource.create(data.resource.resourceType, data.resource)

      const resourceReference = { id, resourceType }

      if (resourceType === 'Practitioner' && id) {
        const schedule = await aidboxClient.resource.override('Schedule', id, {
          actor: [{ reference: `${resourceType}/${id}` }],
          active: true
        })

        await aidboxClient
          .getHttpClient()
          .post('ScheduleExtension?', { json: { reference: { id: schedule.id, resourceType: 'Schedule' } } })
          .json<Record<string, any>>()
      }

      const user = await aidboxClient
        .getHttpClient()
        .post('User', {
          json: {
            ...data.user,
            name: { givenName: data.resource.name?.[0].given?.[0], familyName: data.resource.name?.[0].family },
            data: { roleName: resourceType.toLowerCase(), verified: true, firstEntry: false },
            link: [{ link: resourceReference }]
          }
        })
        .json<User>()

      return reply.send(user)
    }
  },
  {
    path: '/User/:id/$update-user',
    method: 'post',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: { data: { resource: Patient | Practitioner, user: User } };
      }>,
      reply: FastifyReply
    ) => {
      const { aidboxClient, params: { id }, body: { data } } = request

      const user = await aidboxClient.getHttpClient()
        .get(`User/${id}`)
        .json<User>()

      await aidboxClient.resource.update(data.resource.resourceType, data.resource.id!, data.resource)

      await aidboxClient.getHttpClient().patch(
        `User/${user.id}`,
        {
          json: {
            ...data.user,
            name: {
              givenName: data.resource.name?.[0].given?.[0] || '',
              familyName: data.resource.name?.[0].family || ''
            }
          }
        }
      )

      return reply.send({ status: true })
    }
  },
  {
    path: '/User/:id/$delete-user',
    method: 'delete',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{
        Params: { id: string };
      }>,
      reply: FastifyReply
    ) => {
      const {
        aidboxClient,
        params: { id }
      } = request

      const user = await aidboxClient.resource.get('User', id)

      const link = user.link?.[0]?.link

      if (link) {
        await aidboxClient
          .getHttpClient()
          .delete(`${link.resourceType}/${link.id}`)
      }
      await aidboxClient.getHttpClient().delete(`User/${id}`)

      return reply.send({
        status: true
      })
    }
  },
  {
    path: '/$twilio/get-token/:user/:root',
    method: 'get',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{
        Params: { user: string; room: string };
      }>,
      reply: FastifyReply
    ) => {
      const { appConfig } = request
      const { user, room } = request.params
      const token = new AccessToken(
        appConfig.twilio.sid,
        appConfig.twilio.key,
        appConfig.twilio.secret,
        { ttl: 14400, identity: user }
      )
      const videoGrant = new VideoGrant({ room })
      token.addGrant(videoGrant)
      return reply.send({ token: token.toJwt() })
    }
  },
  {
    path: '/Appointment/$get-list',
    method: 'post',
    authRequired: false,
    handler: async (
      request: FastifyRequest<{ Body: { data: { patient: string, practitioner?: string, history?: boolean } } }>,
      reply: FastifyReply
    ) => {
      const { aidboxClient, body: { data: params } } = request
      console.log('HISTORY: ', params)

      let query = `SELECT jsonb_build_object(
            'appointment', a.resource || jsonb_build_object('id', a.id),
            'encounter', enc.resource || jsonb_build_object('id', enc.id),
            'practitioner', pract.resource || jsonb_build_object('id', pract.id),
            'patient', pt.resource || jsonb_build_object('id', pt.id)
        ) as result
        FROM encounter enc
        INNER JOIN appointment a on enc.resource#>>'{appointment,0,id}' = a.id
        INNER JOIN practitioner pract on pract.id = enc.resource#>>'{participant,0,individual,id}'
        INNER JOIN patient pt on pt.id = enc.resource#>>'{subject,id}'
        WHERE 1=1`

      if (params.history) {
        query += ' AND  a.resource #>> \'{ status }\' in (\'cancelled\', \'fulfilled\')'
      } else {
        query += ' AND not(a.resource #>> \'{ status }\' in (\'cancelled\', \'fulfilled\'))'
      }

      if ('practitioner' in params) {
        query += ` AND enc.resource#>>'{participant,0,individual,id}' = '${params.practitioner}'`
      }

      if ('patient' in params) {
        query += ` AND enc.resource#>>'{subject,id}' = '${params.patient}'`
      }

      query += ' ORDER by a.resource#>>\'{start}\' DESC'

      const data = await aidboxClient.rawSQL<any>(query)

      const response = data.map((res: any) => ({
        id: res.result.appointment.id,
        start: res.result.appointment.start,
        end: res.result.appointment.end,
        status: res.result.appointment.status,
        chiefComplaint: getIn(res.result.appointment, ['reasonCode', 0, 'text'], null),
        participant: {
          patient: res.result.patient,
          practitioner: res.result.practitioner
        },
        encounterID: res.result.encounter.id
      }))

      return reply.send(response)
    }
  },
  {
    path: '/Appointment/$create',
    method: 'post',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{ Body: { data: AppointmentData } }>,
      reply: FastifyReply
    ) => {
      const { aidboxClient, body: { data } } = request

      if (!data) { return reply.status(400).send({ error: { message: 'Missing appointment information' } }) }

      const body = transformAppointmentCreateDataToEncounter(data)

      if (!body) { return reply.status(400).send({ error: { message: 'Incorrect appointment information' } }) }

      const { start } = data

      const existedAppointment = await aidboxClient
        .getHttpClient()
        .get(`Appointment?.start=${start}`)
        .json<Record<string, any>>()

      const isExistedAppointment = existedAppointment.total !== 0

      if (isExistedAppointment) {
        return reply.status(400).send({
          error: { message: 'Appointment is already existed!' }
        })
      }

      const appointment = await aidboxClient
        .getHttpClient()
        .post('Appointment', { json: transformAppointmentData(data) })
        .json<Appointment>()

      const encounter = await aidboxClient
        .getHttpClient()
        .put('Encounter', {
          json: {
            ...body,
            appointment: [{ resourceType: 'Appointment', id: appointment.id }]
          }
        })
        .json<Encounter>()

      console.log('1')

      const rows = await aidboxClient.rawSQL<any>(
        `select * from "user" where resource #>> '{ link, 0, link, id }' in ('${data.practitioner}', '${data.patient}')`
      )

      await aidboxClient
        .getHttpClient()
        .post(`NodeChat/${encounter.id}/$create`, {
          json: {
            participant: rows.map((row: any) => {
              return {
                name: row.resource.name,
                user: row.resource.link[0].link
              }
            })
          }
        })

      await aidboxClient.resource.create('DocumentReference', {
        docStatus: 'preliminary',
        status: 'current',
        date: new Date().toISOString(),
        subject: encounter.subject,
        type: { coding: [{ code: '11488-4', system: 'http://loinc.org' }] },
        author: [{ reference: `Practitioner/${encounter.participant?.[0].individual?.id}` }],
        context: { encounter: [{ reference: `Encounter/${encounter.id}` }] },
        content: [{ attachment: { contentType: 'text/plain' } }]
      })

      return reply.send({ id: appointment.id })
    }
  },
  {
    path: '/Appointment/:id/$delete',
    method: 'delete',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const {
        aidboxClient,
        params: { id }
      } = request

      const appointment = await aidboxClient.resource.delete('Appointment', id)
      let encounter
      if (appointment) {
        encounter = await aidboxClient
          .getHttpClient()
          .delete(`Encounter?appointment=${appointment.id}`)
          .json<Record<string, any>>()
      }

      if (encounter) {
        await aidboxClient
          .getHttpClient()
          .delete(`DocumentReference?encounter=${encounter.id}`)

        await aidboxClient.getHttpClient().delete(`Chat/${encounter.id}`)
      }

      if (appointment?.slot?.[0]) {
        await aidboxClient.resource.update('Slot', appointment.slot[0].id!, {
          status: 'free'
        })
      }

      return reply.send({ status: true })
    }
  },
  {
    path: '/Encounter/:id/$get-info',
    method: 'get',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { aidboxClient, params: { id } } = request

      const encounter = await aidboxClient.resource.get('Encounter', id)
      const docRef = await aidboxClient
        .getHttpClient()
        .get(`DocumentReference?.context.encounter.0.id=${encounter.id}`)
        .json<Record<string, any>>()

      const condition = await aidboxClient
        .getHttpClient()
        .get(`Condition?.encounter.id=${encounter.id}`)
        .json<Record<string, any>>()

      const allergy = await aidboxClient
        .getHttpClient()
        .get(`AllergyIntolerance?.encounter.id=${encounter.id}`)
        .json<Record<string, any>>()

      const medication = await aidboxClient
        .getHttpClient()
        .get(`MedicationRequest?.encounter.id=${encounter.id}`)
        .json<Record<string, any>>()

      const result = {
        ...encounter,
        medication: medication.entry ?? [],
        consultNote: docRef.entry?.[0].resource ?? null,
        condition: condition.entry ?? [],
        allergyIntolerance: allergy.entry ?? []
      }

      return reply.send(result)
    }
  },
  {
    path: '/Encounter/$get-list',
    method: 'get',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{
        Querystring: { practitioner?: string; patient?: string };
      }>,
      reply: FastifyReply
    ) => {
      const { aidboxClient, query: params } = request

      let query = `select jsonb_build_object('encounter', a.resource || jsonb_build_object('id', a.id),
                                         'encounter', enc.resource || jsonb_build_object('id', enc.id),
                                         'practitioner', pract.resource || jsonb_build_object('id', pract.id),
                                         'patient', pt.resource || jsonb_build_object('id', pt.id)
    ) result
               from encounter enc
    inner join appointment a
                on enc.resource#>>'{appointment,0,id}' = a.id
    inner join practitioner pract
               on pract.id = enc.resource#>>'{participant,0,individual,id}'
    inner join patient pt
                on pt.id = enc.resource#>>'{subject,id}'
    WHERE 1=1`

      if ('practitioner' in params) {
        query += ` AND enc.resource#>>'{participant,0,individual,id}' = '${params.practitioner}'`
      }
      if ('patient' in params) {
        query += ` AND enc.resource#>>'{subject,id}' = '${params.patient}'`
      }
      query += ' order by a.cts desc'
      const data = await aidboxClient.rawSQL<any>(query)

      const response = data.map((res: any) => ({
        id: res.result.encounter.id,
        start: res.result.encounter.period.start,
        end: res.result.encounter.period.end || null,
        status: res.result.encounter.status,
        chiefComplaint: getIn(
          res.result.encounter,
          ['reasonCode', 0, 'text'],
          null
        ),
        condition: res.result.condition,
        participant: {
          patient: res.result.patient,
          practitioner: res.result.practitioner
        },
        encounterID: res.result.encounter.id
      }))
      return reply.send(response)
    }
  },
  {
    path: '/Encounter/:id/$start',
    method: 'get',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{
        Params: { id: string };
      }>,
      reply: FastifyReply
    ) => {
      const { aidboxClient, params: { id } } = request

      const { appointment: appointmentsList } = await aidboxClient.resource.get('Encounter', id)

      if (appointmentsList?.[0].id) {
        await aidboxClient.resource.update('Appointment', appointmentsList[0].id, { status: 'arrived' })
      }

      await aidboxClient.resource.update('Encounter', id, { status: 'in-progress' })

      return reply.send({ status: true })
    }
  },
  {
    path: '/Encounter/:id/$finish',
    method: 'get',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { aidboxClient, params: { id } } = request

      const { appointment: appointmentsList } = await aidboxClient.resource.get('Encounter', id)

      console.log('ENCOUNTER ID: ', id)
      console.log('APPOINTMENTS: ', JSON.stringify(appointmentsList))
      console.log('APPOINTMENT ID: ', appointmentsList?.[0]?.id)
      if (appointmentsList?.[0]?.id) {
        await aidboxClient.resource.update('Appointment', appointmentsList[0].id, { status: 'fulfilled' })
      }

      await aidboxClient.resource.update('Encounter', id, { status: 'finished' })
      await aidboxClient.getHttpClient().patch(`Chat/${id}`, { json: { status: 'closed' } })

      return reply.send({ status: true })
    }
  }
]
