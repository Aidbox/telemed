import { createRoute } from 'atomic-router'
import { useUnit } from 'effector-react'
import React, { useEffect } from 'react'

import AddIcon from '../assets/Add.svg'
import css from '../components/Appointment/Appointment.module.css'
import { Header } from '../components/Layout/Header'
import { Detail, Master, MasterDetailLayout } from '../components/Layout/MasterDetailLayout'
import UpdateUserForm from '../components/User/UpdateUserForm'
import { UsersList } from '../components/User/UsersList'
import {
  CHANGE_INTERFACE,
  CHANGE_RESOURCE_PROPERTY,
  CLEAR_FORM, CREATE_RESOURCE,
  GET_RESOURCE,
  GET_USERS_LIST,
  REMOVE_USER,
  UPDATE_RESOURCE, UsersInterfaceState,
  UsersListStore
} from '../service/manage-user'
import { User } from '../service/session'

const route = createRoute()
const goToPostsRoute = createRoute()

export function Page () {
  const users = useUnit(UsersListStore)
  const status = useUnit(UsersInterfaceState)

  useEffect(() => { GET_USERS_LIST() }, [])

  const removeUser = (id: string) => {
    if (confirm('Do you want to Delete user?')) {
      REMOVE_USER(id)
      CHANGE_INTERFACE('none')
    }
  }

  const selectUser = (user: User) => {
    GET_RESOURCE(user)
    CHANGE_INTERFACE('update')
  }

  const openCreateUserForm = () => {
    CLEAR_FORM()
    CHANGE_RESOURCE_PROPERTY({ resourceType: 'Patient', gender: 'female' })
    CHANGE_INTERFACE('create')
  }

  return (
    <MasterDetailLayout>
      <Master>
        <Header>Users</Header>

        {['none', 'update'].includes(status) && <a className={css.appointments__link} onClick={openCreateUserForm}>
          <AddIcon height='32' />
          Create new user
        </a>}

        {status === 'create' && (
          <UpdateUserForm
            horizontal cancel={() => CHANGE_INTERFACE('none')}
            create={CREATE_RESOURCE}
          />
        )}

        <UsersList
          users={users}
          remove={removeUser}
          select={selectUser}
          selected={null}
        />

        <p>Users count: {users.length}</p>
      </Master>

      <Detail>
        {status === 'update' && (
          <>
            <Header>Edit User</Header>
            <UpdateUserForm
              horizontal={false} cancel={() => CHANGE_INTERFACE('none')}
              update={UPDATE_RESOURCE}
            />
          </>
        )}
      </Detail>
    </MasterDetailLayout>
  )
}

export const Users = {
  route,
  goToPostsRoute,
  Page
}
