import { Practitioner, Patient } from 'aidbox/types'
import { createEffect, createEvent, createStore, sample } from 'effector'

import { box, R, http } from './aidbox'
import { Session } from './session'

type NULL<T> = T | null

export interface AppointmentStore {
  loading: boolean,
  error: undefined,
  selected: string | undefined,
  list: Array<{
    id: string
    start: string
    end: string
    status: string
    chiefComplaint: string | null,
    encounterID: string,
    participant: { patient: Patient, practitioner: Practitioner },
  }>
}

interface PractitionerStore {
  loading: boolean,
  error: undefined,
  selected: string | undefined,
  list: Array<Practitioner>
}

export type Schedule = Array<{ date: string, times: Array<{start: string, duration: string}> }>
export type AppointmentData = {
  patient: string
  practitioner: string
  start: string
  end: string
  chief: string
}

export const GET_APPOINTMENT_LIST = createEvent<NULL<Patient | Practitioner>>()
export const GET_APPOINTMENT_HISTORY = createEvent<NULL<Patient | Practitioner>>()
export const GET_PRACTITIONER_SCHEDULE = createEvent<string>()
export const GET_PRACTITIONER_LIST = createEvent()
export const SELECT_APPOINTMENT = createEvent<string>()
export const SELECT_APPOINTMENT_FROM_HISTORY = createEvent<string>()
export const CREATE_APPOINTMENT = createEvent<AppointmentData>()
export const CANCEL_APPOINTMENT = createEvent()

export const Practitioners = createStore<PractitionerStore>({
  loading: false,
  error: undefined,
  selected: undefined,
  list: []
})

export const Appointments = createStore<AppointmentStore>({
  loading: false,
  error: undefined,
  selected: undefined,
  list: []
})

export const AppointmentsHistory = createStore<AppointmentStore>({
  loading: false,
  error: undefined,
  selected: undefined,
  list: []
})

export const PractitionerSchedule = createStore<Schedule>([])

const cancelAppointment = createEffect<AppointmentStore['list'][0] | undefined, void>(async (appointment) => {
  if (appointment) {
    await Promise.all([
      box.resource.update('Appointment', appointment.id, { status: 'cancelled' }),
      await box.resource.update('Encounter', appointment.encounterID, { status: 'cancelled' }),
      await http.patch(`Chat/${appointment.encounterID}`, { json: { status: 'closed' } })
    ])
  }
})

const getAppointmentList = createEffect<Patient | Practitioner, R<AppointmentStore['list']>>(async (resource) => {
  return http.post(
    'Appointment/$get-list',
    { json: { [resource.resourceType.toLowerCase()]: resource.id, history: false } }
  )
})

const getAppointmentHistory = createEffect<Patient | Practitioner, R<AppointmentStore['list']>>(async (resource) => {
  return http.post(
    'Appointment/$get-list',
    { json: { [resource.resourceType.toLowerCase()]: resource.id, history: true } }
  )
})

export const createAppointment = createEffect<AppointmentData, unknown>(async (data) => {
  return http.post('Appointment/$create', { json: data })
})

const getPractitionerSchedule = createEffect<string, R<{ resource: Schedule }>>(async (id) => {
  return http.post(
    `Schedule/${id}/$slots`,
    { json: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, range: 5 } }
  )
})

const getPractitionerList = createEffect<void, Array<Practitioner>>(async () => {
  const response = await box.resource.list('Practitioner')
  return (response.entry || []).map(item => item.resource)
})

PractitionerSchedule.on(getPractitionerSchedule.doneData, (s, data) => {
  return data.response.data.resource
})

Appointments
  .on(SELECT_APPOINTMENT, (store, id) => ({ ...store, selected: id }))
  .on(getAppointmentList.doneData, (store, list) => ({ ...store, list: list.response.data }))

AppointmentsHistory
  .on(SELECT_APPOINTMENT_FROM_HISTORY, (store, id) => ({ ...store, selected: id }))
  .on(getAppointmentHistory.doneData, (store, list) => ({ ...store, list: list.response.data }))

Practitioners
  .on(getPractitionerList.doneData, (s, data) => ({ ...s, list: data }))

sample({
  clock: GET_APPOINTMENT_LIST,
  filter: (resource): resource is Patient | Practitioner => resource !== null,
  target: getAppointmentList
})
sample({
  clock: GET_APPOINTMENT_HISTORY,
  filter: (resource): resource is Patient | Practitioner => resource !== null,
  target: getAppointmentHistory
})
sample({ clock: GET_PRACTITIONER_SCHEDULE, target: getPractitionerSchedule })
sample({ clock: GET_PRACTITIONER_LIST, target: getPractitionerList })
sample({ clock: CREATE_APPOINTMENT, target: createAppointment })
sample({
  clock: CANCEL_APPOINTMENT,
  source: Appointments,
  fn: (store) => store.list.find(item => item.id === store.selected),
  target: cancelAppointment
})
sample({
  clock: cancelAppointment.done,
  source: Session,
  fn: (store) => store.resource,
  target: GET_APPOINTMENT_LIST
})
