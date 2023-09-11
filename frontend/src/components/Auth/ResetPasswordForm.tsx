import { useUnit } from 'effector-react'
import React from 'react'

import Logo from '../../assets/logo-full.svg'
import { SUBMIT_FORM, CHANGE_FORM_PROPERTY, ResetPasswordStore } from '../../service/reset-password'
import Button from '../Button/Button'

import css from './Auth.module.css'

export function ResetPasswordForm () {
  const { loading, form } = useUnit(ResetPasswordStore)

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    SUBMIT_FORM()
  }

  return (
    <form onSubmit={submit} className={css.form}>
      <span className='my-4 d-flex justify-content-center'>
        <Logo />
      </span>

      <input
        className='form-control form-control-lg mb-3'
        type='password'
        name='password'
        value={form.password}
        required
        onChange={(event) => CHANGE_FORM_PROPERTY({ password: event.target.value })}
        placeholder='Password'
        autoComplete='off'
      />

      <input
        className='form-control form-control-lg mb-3'
        type='password'
        name='passwordConfirmation'
        value={form.passwordConfirmation}
        required
        onChange={(event) => CHANGE_FORM_PROPERTY({ passwordConfirmation: event.target.value })}
        placeholder='Password confirm'
        autoComplete='off'
      />

      <Button
        type='submit' variant='primary'
        disabled={loading || form.password !== form.passwordConfirmation}
      >
        {loading ? 'Loading...' : 'Submit'}
      </Button>
    </form>
  )
}
