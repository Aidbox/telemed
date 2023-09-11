import { createRoute } from 'atomic-router'
import React from 'react'

import { ForgotPasswordForm } from '../components/Auth/ForgotPasswordForm'

const route = createRoute()
const goToPostsRoute = createRoute()

const Page = () => {
  console.log('FORGOT PASSWORD')
  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: 500 }}>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}

export const ForgotPassword = {
  route,
  goToPostsRoute,
  Page
}
