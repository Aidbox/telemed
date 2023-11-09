import { Patient, Practitioner } from 'aidbox/types'
import { createEffect, createEvent, createStore, sample } from 'effector'

import { http } from './aidbox'

export type Encounter = {
  id: string
  status: string
  start: string
  participant: { patient: Patient, practitioner: Practitioner }
  chiefComplaint: string
}

export interface EncountersListStore {
  loading: boolean,
  error: undefined,
  selected: string | undefined,
  list: Array<Encounter>
}
export const EncountersStore = createStore<EncountersListStore>({ loading: false, error: undefined, selected: undefined, list: [] })

export const GET_ENCOUNTER_LIST = createEvent<Patient | Practitioner>()

const getEncountersList = createEffect(async (resource: Patient | Practitioner) => {
  const { response } = await http.post<Array<Encounter>>('Encounter/$get-list', { json: { [resource.resourceType.toLowerCase()]: resource.id } })
  return response.data
})

EncountersStore
  .on(getEncountersList.pending, (s, loading) => ({ ...s, loading }))
  .on(getEncountersList.doneData, (s, list) => ({ ...s, list, loading: false }))

sample({ clock: GET_ENCOUNTER_LIST, target: getEncountersList })
