import { createEffect, createEvent, createStore, sample } from 'effector';

import { E, http } from './aidbox';

export interface ForgotPasswordState {
  done: boolean;
  loading: boolean;
  error: { code: string } | undefined;
  form: { email: string };
}

export const SUBMIT_FORM = createEvent();
export const CHANGE_FORM_PROPERTY =
  createEvent<
    Partial<{ [property in keyof ForgotPasswordState['form']]: string }>
  >();

export const ForgotPasswordStore = createStore<ForgotPasswordState>({
  done: false,
  loading: false,
  error: undefined,
  form: { email: '' },
});

export const sendPasswordRecoveryLink = createEffect<
  ForgotPasswordState['form'],
  unknown,
  E<{ code: string }>
>(async (data) => {
  return http.post('auth/$password-recovery', { json: data });
});

ForgotPasswordStore.on(CHANGE_FORM_PROPERTY, (store, property) => ({
  ...store,
  form: { ...store.form, ...property },
}))
  .on(sendPasswordRecoveryLink.pending, (store, status) => ({
    ...store,
    loading: status,
  }))
  .on(sendPasswordRecoveryLink.fail, (store, { error }) => ({
    ...store,
    error: error.response.data,
  }))
  .on(sendPasswordRecoveryLink.done, (store) => ({ ...store, done: true }));

sample({
  clock: SUBMIT_FORM,
  source: ForgotPasswordStore,
  fn: (s) => s.form,
  target: sendPasswordRecoveryLink,
});
