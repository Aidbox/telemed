import { createRoute } from 'atomic-router'
import { useUnit } from 'effector-react'
import React, { useEffect } from 'react'

import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs'
import { Header } from '../components/Layout/Header'
import { Master, MasterDetailLayout } from '../components/Layout/MasterDetailLayout'
import UserForm from '../components/User/UpdateUserForm'
import { router } from '../Router'
import { GET_RESOURCE, UPDATE_RESOURCE } from '../service/manage-user'
import { GET_USER_INFO, Session } from '../service/session'

const route = createRoute()
const backToHomeRoute = createRoute()

const breadcrumbs = [
  { name: 'Profile', path: '/profile', active: false },
  { name: 'Edit', path: '', active: true }
]

const Page = () => {
  const session = useUnit(Session)
  useEffect(() => { if (session.user) GET_RESOURCE(session.user) }, [session.user])

  const update = () => {
    UPDATE_RESOURCE()
    router.push({ path: '/profile', params: {}, query: {}, method: 'push' })
  }

  return (
    <MasterDetailLayout>
      <Master>
        <Header>Update Profile</Header>
        <Breadcrumbs list={breadcrumbs} />
        <div style={{ width: 375 }}>
          <UserForm
            horizontal={false} update={update}
            cancel={() => router.push({ path: '/profile', params: {}, query: {}, method: 'push' })}
          />
        </div>
      </Master>
    </MasterDetailLayout>
  )
}

export const ProfileUpdate = {
  route,
  backToHomeRoute,
  Page
}
