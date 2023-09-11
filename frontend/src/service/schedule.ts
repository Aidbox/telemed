import { createEffect, createEvent, createStore, sample } from 'effector'

import { http, R } from './aidbox'

export type WeekDays = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export type Dow = { [key in WeekDays]: boolean }
export type Time = { start: string, end: string, duration: number }
export type RulesStore = { [key in WeekDays]: { times: Array<Time> } }

export const GET_PRACTITIONER_SCHEDULE = createEvent<string>()
export const UPDATE_PRACTITIONER_SCHEDULE = createEvent<{ practitionerId: string, rules: Array<{ daysOfWeek: [WeekDays], availableEndTime: string, availableStartTime: string, duration: number }>}>()

export const Rules = createStore<Partial<RulesStore>>({})

const getSchedule = createEffect<string, R<Partial<{ id: string, rules: RulesStore }>>>(async (practitionerId) => {
  return http.post(`Schedule/${practitionerId}/$rules`, {
    json: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }
  })
})

const updateSchedule = createEffect<{ practitionerId: string, rules: Array<{ daysOfWeek: [WeekDays], availableEndTime: string, availableStartTime: string, duration: number }>}, string>(async ({ practitionerId, rules }) => {
  await http.patch(`Schedule/${practitionerId}/$rules`, {
    json: { availableTime: rules }
  })

  return practitionerId
})

Rules.on(getSchedule.doneData, (store, { response: { data } }) => {
  console.log(data)
  return { ...store, ...data.rules }
})

sample({ clock: GET_PRACTITIONER_SCHEDULE, target: getSchedule })
sample({ clock: UPDATE_PRACTITIONER_SCHEDULE, target: updateSchedule })
sample({ clock: updateSchedule.doneData, target: GET_PRACTITIONER_SCHEDULE })
