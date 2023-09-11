import { Link } from 'atomic-router-react'
import { useUnit } from 'effector-react'
import React from 'react'

import Logo from '../../assets/logo-full.svg'
import { CHANGE_FORM_PROPERTY, SignUpStore, ConfirmationStore, SUBMIT_FORM, RESEND_EMAIL } from '../../service/sign-up'
import Button from '../Button/Button'
import TimeBlocker from '../TimeBlocker/TimeBlocker'

import classes from './Auth.module.css'

export function SignUpForm () {
  const { loading, form, error } = useUnit(SignUpStore)
  const confirmationStore = useUnit(ConfirmationStore)

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    SUBMIT_FORM()
  }

  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    RESEND_EMAIL()
  }

  if (confirmationStore) {
    return (
      <div>
        <span className='text-center'>
          Please check and verify your email. We sent an email to <strong>{confirmationStore.id}</strong>.<br />
          Didn't receive the email?&nbsp;

          <TimeBlocker lastUpdated={confirmationStore.lastUpdated}>
            <a href='' onClick={onClick}>Resend Email</a>
          </TimeBlocker>
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
        value={form.email}
        required
        onChange={(event) => CHANGE_FORM_PROPERTY({ email: event.target.value })}
        placeholder='example@email.com'
      />

      {error?.code === 'EMAIL_TAKEN' && <p>Email already taken. <Link to='/auth/password-recovery'>Forgot password?</Link></p>}

      <input
        className='form-control form-control-lg mb-3'
        type='text'
        value={form.firstname}
        required
        onChange={(event) => CHANGE_FORM_PROPERTY({ firstname: event.target.value })}
        placeholder='First name'
      />

      <input
        className='form-control form-control-lg mb-3'
        type='text'
        value={form.lastname}
        required
        onChange={(event) => CHANGE_FORM_PROPERTY({ lastname: event.target.value })}
        placeholder='Last name'
      />

      <input
        className='form-control form-control-lg mb-3'
        type='password'
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
        required
        onChange={(event) => CHANGE_FORM_PROPERTY({ passwordConfirmation: event.target.value })}
        placeholder='Confirm password'
        autoComplete='off'
      />

      <Button
        variant='primary'
        type='submit' full
        disabled={loading || form.password !== form.passwordConfirmation}
      >
        {loading ? 'Loading...' : 'Sign Up'}
      </Button>
    </form>
  )
}
