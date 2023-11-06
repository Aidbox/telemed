import { BaseResponseResource } from 'aidbox'
import { Patient, Practitioner } from 'aidbox/types'
import { combine, createEffect, createEvent, createStore, sample } from 'effector'

import { box, E, http, R } from './aidbox'
import { updateUser } from './manage-user'

type NULL<T> = T | null

export interface User {
  data: { firstEntry?: boolean, verified?: boolean, roleName: 'patient' | 'practitioner' | 'admin' },
  name: { givenName: string, familyName: string },
  email: string,
  password: string,
  id: string,
  link: Array<{ link: { id: string, resourceType: 'Patient' | 'Practitioner', display?: string } }>
  resourceType: 'User'
}

export const GET_USER_INFO = createEvent()
export const LOG_OUT = createEvent()

const User = createStore<NULL<User>>(null)
const Resource = createStore<NULL<Patient | Practitioner>>(null)

export const Session = combine(User, Resource, (user, resource) => {
  return {
    isAdmin: user?.data.roleName === 'admin',
    isPatient: user?.data.roleName === 'patient',
    isPractitioner: user?.data.roleName === 'practitioner',
    user,
    resource
  }
})

interface UserInfo extends User { sub: string }

export const getUserInfo = createEffect<void, R<UserInfo>, E<{ code: string }>>(async () => {
  return http.get('auth/userinfo')
})

const getResource = createEffect<User, BaseResponseResource<'Patient' | 'Practitioner'>, E<{ code: string }>>(async (data) => {
  const resource = data.link[0].link
  return box.resource.get(resource.resourceType, resource.id)
})

const signOut = createEffect(async () => {
  return box.auth.storage.set('')
})

Resource.on(getResource.doneData, (store, response) => response)
User.on(getUserInfo.doneData, (store, { response: { data: { sub, ...data } } }) => {
  console.log(sub)
  return data
})

sample({ clock: GET_USER_INFO, target: getUserInfo })
sample({ clock: LOG_OUT, target: signOut })
sample({ clock: getUserInfo.doneData, fn: (user: R<User>) => user.response.data, target: getResource })
sample({ clock: updateUser.done, source: User, filter: (store, { result: userId }) => store?.id === userId, target: GET_USER_INFO })
