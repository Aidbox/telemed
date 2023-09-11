import { createRoute } from 'atomic-router'
import React from 'react'

import { ResetPasswordForm } from '../components/Auth/ResetPasswordForm'

const route = createRoute()
const goToPostsRoute = createRoute()

const Page = () => {
  console.log('RESET PASSWORD')
  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: 500 }}>
        <ResetPasswordForm />
      </div>
    </div>
  )
}

export const ResetPassword = {
  route,
  goToPostsRoute,
  Page
}
