import { Patient } from 'aidbox/types'
import { createEffect, createEvent, createStore, sample } from 'effector'

import { box } from './aidbox'

export interface PatientListStore {
  loading: boolean,
  error: undefined,
  selected: string | undefined,
  list: Array<Patient>
}

export const PatientsStore = createStore<PatientListStore>({ loading: false, error: undefined, selected: undefined, list: [] })

export const GET_PATIENT_LIST = createEvent()

const getPatientsList = createEffect(async () => await box.resource.list('Patient'))

PatientsStore
  .on(getPatientsList.pending, (s, loading) => ({ ...s, loading }))
  .on(getPatientsList.doneData, (s, { entry }) => ({ ...s, list: (entry || []).map(({ resource }) => resource), loading: false }))

sample({ clock: GET_PATIENT_LIST, target: getPatientsList })
