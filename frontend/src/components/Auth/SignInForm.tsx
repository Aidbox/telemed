import { useUnit } from 'effector-react'
import React from 'react'

import Logo from '../../assets/logo-full.svg'
import {
  CHANGE_FORM_PROPERTY,
  SUBMIT_FORM,
  SignInStore,
  ConfirmationEmail, ConfirmationCode
} from '../../service/sign-in'
import Button from '../Button/Button'
import { Link } from '../Link'

import css from './Auth.module.css'

export function SignInForm () {
  const { loading, form } = useUnit(SignInStore)
  const confirmationCode = useUnit(ConfirmationCode)
  const email = useUnit(ConfirmationEmail)

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    SUBMIT_FORM()
  }

  const dangerColor = { color: 'var(--danger)' }
  const successColor = { color: 'var(--success)' }

  return (
    <>
      <form onSubmit={submit} className={css.form}>
        <span className='my-4 d-flex justify-content-center'>
          <Logo />
        </span>

        <input
          className='form-control form-control-lg mb-3'
          type='text'
          name='username'
          value={form.username}
          autoComplete='false'
          required
          onChange={(event) => CHANGE_FORM_PROPERTY({ username: event.target.value })}
          placeholder='Login or email'
        />

        <input
          className='form-control form-control-lg mb-3'
          type='password'
          value={form.password}
          placeholder='Password'
          autoComplete='false'
          name='password'
          required
          onChange={(event) => CHANGE_FORM_PROPERTY({ password: event.target.value })}
        />

        <Button
          variant='primary' full
          disabled={loading} type='submit'
        >
          {loading ? 'Loading...' : 'Login'}
        </Button>

        <div className={`${css['login-form__bottom-link']}`}>
          <Link to='/auth/sign-up'>
            Registration
          </Link>

          <Link to='/auth/forgot-password'>
            Forgot password
          </Link>
        </div>
      </form>

      {confirmationCode && ['error', 'loading', 'success'].includes(confirmationCode.status) && (
        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', justifyContent: 'center' }}>
          {confirmationCode.status === 'error' && <div style={dangerColor}>Wrong verification code. Please try another</div>}
          {confirmationCode.status === 'loading' && 'Loading...'}
          {confirmationCode.status === 'success' && <div style={successColor}>Email <strong>{email}</strong> has been verified<br /></div>}
        </div>
      )}
    </>
  )
}

const AccountConfirmation = ({ status, email }: { status: string, email: string }) => {
  const dangerColor = { color: 'var(--danger)' }
  const successColor = { color: 'var(--success)' }

  return null
}
