import { AllergyIntolerance, Condition, Medication, DocumentReference, Patient, Practitioner } from 'aidbox/types'
import { createEffect, createEvent, createStore, sample } from 'effector'

import { http, R } from './aidbox'

type TEncounterStore = {
  id: string
  loading: boolean
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled'
  patient?: Patient
  practitioner?: Practitioner
  medication: Array<Medication>,
  consultNote: DocumentReference | undefined,
  condition: Array<Condition>,
  allergyIntolerance: Array<AllergyIntolerance>
}

const defaultEncounter: TEncounterStore = {
  id: '',
  loading: true,
  status: 'finished',
  medication: [],
  consultNote: undefined,
  condition: [],
  allergyIntolerance: []
}

export const EncounterStore = createStore<TEncounterStore>(defaultEncounter)

export const GET_ENCOUNTER = createEvent<string>()
export const START_ENCOUNTER = createEvent<string>()
export const FINISH_ENCOUNTER = createEvent<string>()

const getEncounter = createEffect<string, R<TEncounterStore>>(async (encounterId) => {
  return http.get(`Encounter/${encounterId}/$get-info`)
})

const startEncounter = createEffect<string, unknown>(async (encounterId) => {
  return http.get(`Encounter/${encounterId}/$start`)
})

export const finishEncounter = createEffect<string, unknown>(async (encounterId) => {
  return http.get(`Encounter/${encounterId}/$finish`)
})

EncounterStore
  .on(getEncounter.pending, (s, loading) => ({ ...s, loading }))
  .on(getEncounter.doneData, (s, { response }) => ({ ...response.data, loading: false }))

sample({ clock: GET_ENCOUNTER, target: getEncounter })
sample({ clock: START_ENCOUNTER, target: startEncounter })
sample({ clock: FINISH_ENCOUNTER, target: finishEncounter })
