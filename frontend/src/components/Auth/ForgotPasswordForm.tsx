import { Link } from 'atomic-router-react'
import { useUnit } from 'effector-react'
import React from 'react'

import Logo from '../../assets/logo-full.svg'
import { CHANGE_FORM_PROPERTY, SUBMIT_FORM, ForgotPasswordStore } from '../../service/forgot-password'
import Button from '../Button/Button'

import classes from './Auth.module.css'

export function ForgotPasswordForm () {
  const { loading, error, form, done } = useUnit(ForgotPasswordStore)

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    SUBMIT_FORM()
  }

  if (done) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <span className='text-center'>
          Please check your email. We sent an email to <strong>{form.email}</strong>.<br />
        </span>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className={classes.form}>
      <span className='my-4 d-flex justify-content-center'>
        <Logo />
      </span>

      <input
        className='form-control form-control-lg mb-3'
        type='email'
        name='email'
        value={form.email}
        required
        onChange={event => CHANGE_FORM_PROPERTY({ email: event.target.value })}
        placeholder='Email'
      />

      {error?.code === 'EMAIL_NOT_FOUND' && <p>User not found. <Link to='/auth/sign-up'>Create a new one?</Link></p>}

      <Button
        type='submit' variant='primary'
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Submit'}
      </Button>
    </form>

  )
}
