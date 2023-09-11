import { createEvent, createStore, createEffect, sample } from 'effector'

import { http, E, R } from './aidbox'

type NULL<T> = T | null

export interface SignUpFormState {
  firstname: string,
  lastname: string,
  email: string,
  password: string,
  passwordConfirmation: string
}

interface SignUpState {
  loading: boolean,
  error: { code: string } | undefined,
  form: SignUpFormState
}

interface ConfirmationStore {
  id: string,
  lastUpdated: string
}

export const SUBMIT_FORM = createEvent()
export const RESEND_EMAIL = createEvent()
export const CHANGE_FORM_PROPERTY = createEvent<Partial<{[property in keyof SignUpFormState]: string}>>()

export const ConfirmationStore = createStore<NULL<ConfirmationStore>>(null)
export const SignUpStore = createStore<SignUpState>({
  loading: false,
  error: undefined,
  form: {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  }
})

export const signUp = createEffect<SignUpFormState, R<{ id: string }>, E<{ code: string }>>(async (data) => {
  return http.post('auth/$sign-up', { json: data })
})

export const resendConfirmation = createEffect<ConfirmationStore, unknown, E<{ code: string }>>(async ({ id }) => {
  return http.post('auth/$resend-confirmation-email', { json: { id } })
})

ConfirmationStore
  .on(signUp.doneData, (_, { response }) => ({ lastUpdated: new Date().toISOString(), id: response.data.id }))
  .on(resendConfirmation.doneData, (store) => ({ ...store || { id: '' }, lastUpdated: new Date().toISOString() }))

SignUpStore
  .on(CHANGE_FORM_PROPERTY, (store, property) => ({ ...store, form: { ...store.form, ...property } }))
  .on(signUp.pending, (store, status) => ({ ...store, loading: status }))
  .on(signUp.fail, (store, { error }) => ({ ...store, error: error.response.data }))

sample({
  clock: RESEND_EMAIL,
  source: ConfirmationStore,
  filter: (store: NULL<ConfirmationStore>): store is ConfirmationStore => store !== null,
  target: resendConfirmation
})

sample({
  clock: SUBMIT_FORM,
  source: SignUpStore,
  fn: (s) => s.form,
  target: signUp
})
