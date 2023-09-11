import { readFile } from 'node:fs/promises'
import path from 'path'

import { Client } from 'aidbox'
import { Appointment } from 'aidbox/types'
import dayjs from 'dayjs'

import { Config } from '../config.js'

const sendEmailToActors = async (
  aidboxClient: Client,
  appointment: Appointment,
  config: Config
) => {
  const notificationName = 'APPOINTMENT_STARTS_IN_5'

  const notifications = await aidboxClient.rawSQL<Array<unknown>>(
    `select resource
     from "emailnotification"
     where resource ->> 'name' = '${notificationName}'
     and resource #>> '{reference,id}' = '${appointment.id}'`
  )

  if (notifications.length) {
    return null
  }

  const participants = appointment.participant.map((item) => `'${item.actor?.id}'`).join(', ')
  const actors = await aidboxClient.rawSQL<Array<{ resource: { email: string, name: string }}>>(
    `select * from "user" where resource #>> '{ link, 0, link, id }' in (${participants})`
  )

  const emailBody = (await readFile(path.resolve('./resources/appointment-notification.html'))).toString()

  actors.forEach(({ resource }) => {
    aidboxClient.getHttpClient().post('EmailNotification', {
      json: {
        name: notificationName,
        reference: {
          resourceType: 'Appointment',
          id: appointment.id
        },
        status: 'in-queue',
        from: config.mailgun.from,
        to: resource.email,
        subject: 'Telemed: Appointment will start in 5 minutes',
        body: emailBody.replace('%USERNAME%', JSON.stringify(resource.name))
      }
    })
  })
}

export const initScheduler = (aidboxClient: Client, config: Config) => {
  aidboxClient.task.implement('task/appointment-reminder-task', async () => {
      const startDate = dayjs()
      const finishDate = startDate.add(6, 'minute')

      const { entry: appointments } = await aidboxClient
        .getHttpClient()
        .get(`Appointment?date=gt${startDate.toISOString()}&date=le${finishDate.toISOString()}`)
        .json<Record<string, any>>()

      appointments?.forEach(({ resource: appointment }: { resource: Appointment }) => {
        sendEmailToActors(aidboxClient, appointment, config)
      })

      return {}
    }
  )
}
