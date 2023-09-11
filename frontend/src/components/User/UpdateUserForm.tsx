import clsx from 'clsx'
import { useUnit } from 'effector-react'
import React, { memo } from 'react'

import {
  ResourceFormStore, UserFormStore, CHANGE_USER_PROPERTY,
  CHANGE_RESOURCE_PROPERTY,
  CHANGE_RESOURCE_ADDRESS,
  CHANGE_RESOURCE_TELECOM,
  CHANGE_RESOURCE_NAME
} from '../../service/manage-user'
import { Session } from '../../service/session'
import Button from '../Button'
import Select from '../Select'

import css from './Users.module.css'

interface Props {
  horizontal: boolean,
  cancel?: () => void,
  create?: () => void,
  update?: () => void
}

function UserForm ({ horizontal, create, update, cancel }: Props) {
  const resourceForm = useUnit(ResourceFormStore)
  const userForm = useUnit(UserFormStore)
  const session = useUnit(Session)

  const isUpdateFlow = typeof update === 'function'
  const isCreateFlow = typeof create === 'function'

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isCreateFlow) create()
    if (isUpdateFlow) update()
  }

  const phone = (resourceForm.telecom || []).find(item => item.system === 'phone')

  return (
    <form
      onSubmit={onSubmit}
      className={clsx({
        [css['user-form']]: true,
        [css['user-form--horizontal']]: horizontal
      })}
    >
      {session.isAdmin && (
        <input
          className='form-control mb-3'
          type='email'
          required
          value={userForm.email}
          onChange={(event) => {
          CHANGE_USER_PROPERTY({ email: event.target.value })
          CHANGE_RESOURCE_TELECOM({ system: 'email', value: event.target.value })
          }}
          placeholder='example@email.com'
        />
      )}

      {session.isAdmin && (
        <input
          className='form-control mb-3'
          type='password'
          required
          value={userForm.password}
          onChange={(event) => CHANGE_USER_PROPERTY({ password: event.target.value })}
          placeholder='Password'
          autoComplete='off'
        />
      )}

      <input
        className='form-control mb-3'
        type='text'
        value={phone?.value || ''}
        onChange={(event) => {
          CHANGE_RESOURCE_TELECOM({ system: 'phone', value: event.target.value })
        }}
        placeholder='Phone Number'
      />

      <input
        className='form-control mb-3'
        type='text'
        value={resourceForm.name?.[0].given?.[0] || ''}
        onChange={(event) => {
          CHANGE_RESOURCE_NAME({ given: [event.target.value] })
        }}
        placeholder='First Name'
      />

      <input
        className='form-control mb-3'
        type='text'
        value={resourceForm.name?.[0].family || ''}
        onChange={(event) => {
          CHANGE_RESOURCE_NAME({ family: event.target.value })
        }}
        placeholder='Last Name'
      />

      <input
        className='form-control mb-3'
        type='text'
        value={resourceForm.address?.[0].country || ''}
        onChange={(event) => CHANGE_RESOURCE_ADDRESS({ country: event.target.value })}
        placeholder='Country'
      />

      <input
        className='form-control mb-3'
        type='text'
        value={resourceForm.address?.[0].city || ''}
        onChange={(event) => CHANGE_RESOURCE_ADDRESS({ city: event.target.value })}
        placeholder='City'
      />

      <input
        className='form-control mb-3'
        type='text'
        value={resourceForm.address?.[0].line?.[0] || ''}
        onChange={(event) => CHANGE_RESOURCE_ADDRESS({ line: [event.target.value] })}
        placeholder='Line'
      />

      <input
        className='form-control mb-3'
        type='text'
        value={resourceForm.address?.[0].postalCode || ''}
        onChange={(event) => CHANGE_RESOURCE_ADDRESS({ postalCode: event.target.value })}
        placeholder='Postal Code'
      />

      <input
        className='form-control mb-3'
        type='date'
        value={resourceForm.birthDate}
        onChange={(event) => CHANGE_RESOURCE_PROPERTY({ birthDate: event.target.value })}
        placeholder='Postal Code'
      />

      {isCreateFlow && (
        <Select
          className='form-control mb-3'
          value={resourceForm.resourceType}
          onChange={(event) => {
            if (event.target.value === 'Patient') CHANGE_RESOURCE_PROPERTY({ resourceType: 'Patient' })
            if (event.target.value === 'Practitioner') CHANGE_RESOURCE_PROPERTY({ resourceType: 'Practitioner' })
          }}
        >
          <option value='Patient'>Patient</option>
          <option value='Practitioner'>Practitioner</option>
        </Select>
      )}

      <Select
        className='form-control mb-3'
        value={resourceForm.gender}
        onChange={(event) => CHANGE_RESOURCE_PROPERTY({ gender: event.target.value })}
      >
        <option value='male'>Male</option>
        <option value='female'>Female</option>
        <option value='other'>Other</option>
        <option value='unknown'>Unknown</option>
      </Select>

      <div className={css['user-form__footer-buttons']}>
        {typeof cancel === 'function' && (
          <Button
            variant='info' full
            size='sm'
            onClick={cancel}
          >
            Cancel
          </Button>
        )}

        <Button
          disabled={false} variant='primary'
          full size='sm'
          type='submit'
        >
          {false ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

export default memo(UserForm, (prev, next) => prev === next)
