import { redirect } from 'atomic-router'
import { createEvent, createStore, createEffect, sample } from 'effector'

import { Appointment } from '../pages/Appointment'

import { box, http, E, R } from './aidbox'
import { GET_USER_INFO } from './session'

type NULL<T> = T | null;

export interface ConfirmationCode {
  code: string;
  status: 'success' | 'loading' | 'error' | 'set';
}

export interface SignInState {
  loading: boolean;
  error: { code: string } | undefined;
  form: { username: string; password: string };
}

export const SUBMIT_FORM = createEvent()
export const CHANGE_FORM_PROPERTY =
  createEvent<Partial<{ [property in keyof SignInState['form']]: string }>>()
export const UPDATE_CONFIRMATION_CODE = createEvent<string>()

export const ConfirmationCode = createStore<NULL<ConfirmationCode>>(null)
export const ConfirmationEmail = createStore<NULL<string>>(null)

export const SignInStore = createStore<SignInState>({
  loading: false,
  error: undefined,
  form: { username: '', password: '' }
})

export const signIn = createEffect<SignInState['form'], unknown, E<{ code: string }>>(async (data) => {
  return box.auth.signIn(data)
})

export const confirmUser = createEffect<string, R<{ email: string }>, E<{ code: string }>>(async (code) => {
  return http.post('auth/$confirm-email', { json: { code } })
})

ConfirmationEmail.on(
  confirmUser.doneData,
  (store, { response }) => response.data.email
)

ConfirmationCode.on(UPDATE_CONFIRMATION_CODE, (store, code) => ({ code, status: 'set' }))
  .on(confirmUser.pending, (store, status) => {
    if (store) return status ? { ...store, status: 'loading' } : store
  })
  .on(confirmUser.failData, (store, status) => {
    if (store) return status ? { ...store, status: 'error' } : store
  })
  .on(confirmUser.doneData, (store, status) => {
    if (store) return status ? { ...store, status: 'success' } : store
  })

SignInStore.on(CHANGE_FORM_PROPERTY, (store, property) => ({
  ...store,
  form: { ...store.form, ...property }
}))
  .on(signIn.pending, (store, status) => ({ ...store, loading: status }))
  .on(signIn.fail, (store, { error }) => ({
    ...store,
    error: error.response.data
  }))

sample({
  clock: SUBMIT_FORM,
  source: SignInStore,
  fn: (s) => s.form,
  target: signIn
})

sample({
  clock: ConfirmationCode,
  filter: (store: NULL<ConfirmationCode>): store is ConfirmationCode => store?.status === 'set',
  fn: (store) => store.code,
  target: confirmUser
})

sample({ clock: signIn.done, target: GET_USER_INFO })
redirect({ clock: signIn.done, route: Appointment.route })
