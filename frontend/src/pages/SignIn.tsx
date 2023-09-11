import { createRoute } from 'atomic-router'
import React from 'react'

import { SignInForm } from '../components/Auth/SignInForm'

const route = createRoute()
const goToPostsRoute = createRoute()

const Page = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: 500 }}>
        <SignInForm />
      </div>
    </div>
  )
}

export const SignIn = { route, goToPostsRoute, Page }
