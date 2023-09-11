import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'
import { FastifyReply } from 'fastify/types/reply'
import { FastifyRequest } from 'fastify/types/request'

import { getIn } from '../../utils/index.js'

interface Slot { start: string, time: string, id: string, duration: number }
export type WeekDays = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

dayjs.extend(timezone)
dayjs.extend(utc)

export const endpoints = [
  {
    path: '/Schedule/:practitionerId/$slots',
    method: 'post',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{
        Params: { practitionerId: string };
        Body: { data: { timezone?: string; range?: number } };
      }>,
      reply: FastifyReply
    ) => {
      const { aidboxClient, params: { practitionerId }, body: { data } } = request

      const practitioner = await aidboxClient.resource.get('Practitioner', practitionerId)

      if (!practitioner) { return reply.status(400).send({ error: { message: "Practitioner doesn't exist" } }) }

      const currentDate = dayjs.utc()
      const startDate = currentDate.toISOString()
      const endDate = currentDate.add(data.range || 1, 'day').toISOString()

      const sql = `with
        avail as (
          select schedule.id, jsonb_array_elements(scheduleextension.resource -> 'availableTime') as avail
          from schedule join scheduleextension on scheduleextension.resource #>> '{ reference, id }' = schedule.id
          where schedule.resource -> 'actor' @> ?
        ),
        intervals as (
          select id, (avail ->> 'duration' || ' min') as duration, jsonb_array_elements_text(avail -> 'daysOfWeek') as day, (avail ->> 'availableStartTime')::time as start, (avail ->> 'availableEndTime')::time as send
          from avail
        ),
        days as (
          select t, ('{mon,tue,wed,thu,fri,sat,sun,mon}'::text[])[EXTRACT(ISODOW FROM t)] as day
          from (select generate_series(?::timestamp(0), ?::timestamp(0), interval '1 day') as t) _
        ),
        slots as (
          select id, day, start, duration, tstzrange(start, start + duration::interval) as rg
          from (select i.id, i.day, i.duration, generate_series((d.t::date + i.start)::timestamp(0), (d.t::date + i.send)::timestamp(0), i.duration::interval) as start from intervals i, days d where i.day = d.day) _
        )
        
        select s.duration, s.start::date::text, s.start::time::text as "time"
        from slots s left join appointment a on tstzrange((a.resource ->> 'start')::timestamptz(0), (a.resource ->> 'end')::timestamptz(0)) && s.rg
        where s.start >= ? and a.id is NULL
        order by s.rg`

      const slots = await aidboxClient.rawSQL<Array<Slot>>(sql, [
        JSON.stringify([{ id: practitioner.id, resourceType: 'Practitioner' }]),
        startDate,
        endDate,
        startDate
      ])

      return {
        resource: slots.reduce<Array<{ date: string, times: { start: string, duration: number}[] }>>((acc, slot) => {
          const index = acc.findIndex((item) => item.date === slot.start)
          const [year, month, day] = slot.start
            .split('-')
            .map((item: string) => Number(item))
          const [hours = 0, minutes = 0, seconds = 0] = slot.time
            .split(':')
            .map((item: string) => Number(item))

          const newSlotTime = {
            start: dayjs
              .utc()
              .second(seconds)
              .minute(minutes)
              .hour(hours)
              .date(day)
              .month(month - 1)
              .year(year)
              .toISOString(),
            duration: slot.duration
          }

          if (index > -1) {
            acc[index].times = [...acc[index].times, newSlotTime]
            return acc
          }

          return [...acc, { date: slot.start, times: [newSlotTime] }]
        }, [])
      }
    }
  },
  {
    path: '/Schedule/:practitionerId/$rules',
    method: 'post',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{
        Params: { practitionerId: string };
        Body: { data: { timezone?: string } };
      }>,
      reply: FastifyReply
    ) => {
      const { body: { data }, aidboxClient, params: { practitionerId } } = request

      const practitioner = await aidboxClient.resource.get('Practitioner', practitionerId)

      if (!practitioner) {
        return reply.status(400).send({ error: { message: 'Practitioner dont exist' } })
      }

      const res = await aidboxClient
        .getHttpClient()
        .get(`Schedule?actor=Practitioner/${practitionerId}`)
        .json<Record<string, any>>()

      const scheduleRulesResource: any = getIn(res, ['entry', 0, 'resource'], undefined)
      const [year, month, day] = '1970-01-01'
        .split('-')
        .map((item) => Number(item))

      const scheduleExtension = await aidboxClient
        .getHttpClient()
        .get(`ScheduleExtension?.reference.id=${scheduleRulesResource.id}&_count=1`)
        .json<Record<string, any>>()

      const availableTime = getIn(scheduleExtension, ['entry', 0, 'resource', 'availableTime'], undefined)

      const scheduleRules = (availableTime || []).reduce(
        (acc: any, rule: any) => {
          const [startHours, startMinutes, startSeconds] =
            rule.availableStartTime.split(':').map((item: any) => Number(item))
          const [endHours, endMinutes, endSeconds] = rule.availableEndTime
            .split(':')
            .map((item: any) => Number(item))

          rule.daysOfWeek.forEach((weekDay: any) => {
            const newTime = {
              duration: rule.duration,
              start: dayjs
                .utc()
                .year(year)
                .month(month)
                .day(day)
                .hour(startHours)
                .minute(startMinutes)
                .second(startSeconds)
                .tz(data.timezone)
                .format('HH:mm'),
              end: dayjs
                .utc()
                .year(year)
                .month(month)
                .day(day)
                .hour(endHours)
                .minute(endMinutes)
                .second(endSeconds)
                .tz(data.timezone)
                .format('HH:mm')
            }

            if (weekDay in acc) {
              acc[weekDay].times.push(newTime)
              acc[weekDay].times.sort(
                (a: any, b: any) =>
                  new Date('1970/01/01 ' + a.start).getTime() -
                  new Date('1970/01/01 ' + b.start).getTime()
              )
            } else {
              acc[weekDay] = { times: [newTime] }
            }
          })

          return acc
        },
        {}
      )

      return reply.send({
        rules: scheduleRules,
        id: scheduleRulesResource.id
      })
    }
  },
  {
    path: '/Schedule/:practitionerId/$rules',
    method: 'patch',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{
        Params: { practitionerId: string };
        Body: { data: { availableTime: Array<{ daysOfWeek: [WeekDays], availableEndTime: string, availableStartTime: string, duration: number }> } };
      }>,
      reply: FastifyReply
    ) => {
      const { body: { data }, aidboxClient, params: { practitionerId } } = request

      const schedule = await aidboxClient
        .resource.list('Schedule')
        .where('actor', `Practitioner/${practitionerId}`)

      const scheduleId = schedule?.entry?.[0].resource.id

      if (!scheduleId) return reply.status(404).send({ error: { message: 'Schedule not found' } })

      const scheduleExtension = await aidboxClient
        .getHttpClient()
        .get(`ScheduleExtension?.reference.id=${scheduleId}&_count=1`)
        .json<Record<string, any>>()

      const scheduleExtensionId = scheduleExtension?.entry?.[0].resource.id

      if (!scheduleExtensionId) return reply.status(404).send({ error: { message: 'Schedule not found' } })
      const result = await aidboxClient
        .getHttpClient()
        .patch(`ScheduleExtension/${scheduleExtensionId}`, { json: data })
        .json<Record<string, any>>()

      return reply.send({ rules: result, id: scheduleId })
    }
  }
]
