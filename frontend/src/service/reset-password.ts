import { redirect } from 'atomic-router'
import { createEffect, createEvent, createStore, sample } from 'effector'

import { Appointment } from '../pages/Appointment'

import { box, E, http } from './aidbox'

type NULL<T> = T | null
export interface ResetPasswordState {
  done: boolean,
  loading: boolean,
  error: { code: string } | undefined,
  form: { password: string, passwordConfirmation: string }
}

export const SUBMIT_FORM = createEvent()
export const CHANGE_FORM_PROPERTY = createEvent<Partial<{[property in keyof ResetPasswordState['form']]: string}>>()
export const UPDATE_RECOVERY_CODE = createEvent<string>()

export const ResetPasswordStore = createStore<ResetPasswordState>({
  done: false,
  loading: false,
  error: undefined,
  form: { password: '12345', passwordConfirmation: '' }
})

const RecoveryCode = createStore<NULL<string>>(null)

export const resetPassword = createEffect<{ password: string, code: string }, unknown, E<{ code: string }>>(async (data) => {
  const response = await http.post<{ email: string }>('auth/$password-recovery-submit', { json: data })
  return box.auth.signIn({ username: response.response.data.email, password: data.password })
})

RecoveryCode
  .on(UPDATE_RECOVERY_CODE, (store, code) => code)

ResetPasswordStore
  .on(CHANGE_FORM_PROPERTY, (store, property) => ({ ...store, form: { ...store.form, ...property } }))
  .on(resetPassword.pending, (store, status) => ({ ...store, loading: status }))
  .on(resetPassword.fail, (store, { error }) => ({ ...store, error: error.response.data }))

sample({
  clock: SUBMIT_FORM,
  source: { form: ResetPasswordStore, code: RecoveryCode },
  filter: (state: { form: ResetPasswordState, code: NULL<string> }): state is { form: ResetPasswordState, code: string } => state.code !== null,
  fn: ({ form, code }) => ({ password: form.form.password, code }),
  target: resetPassword
})

redirect({ clock: resetPassword.done, route: Appointment.route })
