import { Patient, Practitioner, Address, ContactPoint, HumanName } from 'aidbox/types'
import { createEffect, createEvent, createStore, sample } from 'effector'

import { box, http, R } from './aidbox'
import { User } from './session'

type Resource = Pick<Patient | Practitioner, 'telecom' | 'name' | 'address' | 'birthDate' | 'gender' | 'resourceType'>

export const UsersListStore = createStore<Array<User>>([])
export const ResourceFormStore = createStore<Partial<Resource>>({})
export const UserFormStore = createStore<Partial<User>>({})
export const UsersInterfaceState = createStore<'create' | 'update' | 'none'>('none')

export const CHANGE_INTERFACE = createEvent<'create' | 'update' | 'none'>()
export const SUBMIT_FORM = createEvent()
export const GET_USERS_LIST = createEvent()
export const REMOVE_USER = createEvent<string>()
export const GET_RESOURCE = createEvent<User>()
export const UPDATE_RESOURCE = createEvent()
export const CREATE_RESOURCE = createEvent()
export const CLEAR_FORM = createEvent()

export const CHANGE_USER_PROPERTY = createEvent<Partial<User>>()
export const CHANGE_RESOURCE_PROPERTY = createEvent<Partial<Resource>>()
export const CHANGE_RESOURCE_ADDRESS = createEvent<Partial<Address>>()
export const CHANGE_RESOURCE_TELECOM = createEvent<ContactPoint>()
export const CHANGE_RESOURCE_NAME = createEvent<Partial<HumanName>>()

const getUsersList = createEffect<void, R<{ entry: Array<{ resource: User }> }>>(async () => {
  return http.get('User?_sort=-createdAt') // &_elements=data,link,name,email
})

const removeUser = createEffect<string, unknown>(async (id) => {
  return http.delete(`User/${id}`)
})

const getUserResource = createEffect<User, Patient | Practitioner>(async (user) => {
  const resourceReference = user.link[0].link
  return box.resource.get(resourceReference.resourceType, resourceReference.id)
})

export const updateUser = createEffect<{ resource: Partial<Patient | Practitioner>, user: Partial<User> }, string>(async (data) => {
  await http.post(`User/${data.user.id}/$update-user`, { json: { ...data, user: { ...data.user, data: { firstEntry: false } } } })
  return data.user.id || ''
})

const createUser = createEffect<{ resource: Partial<Patient | Practitioner>, user: Partial<User> }, unknown>(async (data) => {
    return http.post('$create-user', { json: data })
})

UsersListStore.on(getUsersList.doneData, (store, { response }) => {
  return response.data.entry.map(item => item.resource) // .filter(item => item.id !== 'admin')
})

UsersInterfaceState.on(CHANGE_INTERFACE, (_, data) => data)

UserFormStore
  .on(CHANGE_USER_PROPERTY, (store, data) => ({ ...store, ...data }))
  .on(GET_RESOURCE, (_, data) => data)
  .on(CLEAR_FORM, () => ({}))

ResourceFormStore
  .on(CHANGE_RESOURCE_PROPERTY, (store, data) => ({ ...store, ...data }))
  .on(CHANGE_RESOURCE_NAME, (store, data) => {
    const name = [...(store.name || [])].shift()
    return { ...store, name: [{ family: '', given: [''], ...name, ...data }] }
  })
  .on(CHANGE_RESOURCE_ADDRESS, (store, data) => {
    const address = [...(store.address || [])].shift()
    return { ...store, address: [{ ...address, ...data }] }
  })
  .on(CHANGE_RESOURCE_TELECOM, (store, data) => {
    const phone = (store.telecom || []).find(item => item.system === 'phone')
    const email = (store.telecom || []).find(item => item.system === 'email')

    if (data.system === 'phone') {
      return { ...store, telecom: [{ system: 'phone', value: '', ...data }, { system: 'email', value: '', ...email }] }
    }

    if (data.system === 'email') {
      return { ...store, telecom: [{ system: 'phone', value: '', ...phone }, { system: 'email', value: '', ...data }] }
    }
  })
  .on(getUserResource.doneData, (store, data) => data)
  .on(CLEAR_FORM, () => ({}))

sample({ clock: GET_USERS_LIST, target: getUsersList })
sample({ clock: REMOVE_USER, target: removeUser })
sample({ clock: GET_RESOURCE, target: getUserResource })
sample({ clock: UPDATE_RESOURCE, source: { resource: ResourceFormStore, user: UserFormStore }, target: updateUser })
sample({ clock: CREATE_RESOURCE, source: { resource: ResourceFormStore, user: UserFormStore }, target: createUser })
sample({ clock: [createUser.done, updateUser.done, removeUser.done], target: GET_USERS_LIST })
sample({ clock: [createUser.done, updateUser.done, removeUser.done], fn: () => 'none' as const, target: CHANGE_INTERFACE })
