import { createRoute } from 'atomic-router'
import React from 'react'

import { SignUpForm } from '../components/Auth/SignUpForm'

const route = createRoute()
const goToPostsRoute = createRoute()

const Page = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: 500 }}>
        <SignUpForm />
      </div>
    </div>
  )
}

export const SignUp = {
  route,
  goToPostsRoute,
  Page
}
