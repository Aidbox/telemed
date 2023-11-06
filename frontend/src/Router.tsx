import { createHistoryRouter, createRouterControls } from 'atomic-router'
import { createRoutesView } from 'atomic-router-react'
import { sample } from 'effector'
import { createBrowserHistory } from 'history'
import { useEffect } from 'react'

import { Layout } from './components/Layout/Layout'
import { Appointment } from './pages/Appointment'
import { FindPractitioner } from './pages/FindPractitioner'
import { ForgotPassword } from './pages/ForgotPassword'
import { NotFound } from './pages/NotFound'
import { Profile } from './pages/Profile'
import { ProfileUpdate } from './pages/ProfileUpdate'
import { ResetPassword } from './pages/ResetPassword'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'
import { Users } from './pages/Users'
import { Visit } from './pages/Visit'
import { UPDATE_RECOVERY_CODE } from './service/reset-password'
import { GET_USER_INFO, getUserInfo } from './service/session'
import { UPDATE_CONFIRMATION_CODE } from './service/sign-in'

export { Profile }

export const routes = [
  { path: '/', route: [Appointment.route, NotFound.backToHomeRoute] },
  { path: '/find-practitioner', route: [FindPractitioner.route, NotFound.backToHomeRoute] },
  { path: '/visit/:encounter', route: [Visit.route, NotFound.backToHomeRoute] },

  { path: '/auth/sign-up', route: [SignUp.route, NotFound.backToHomeRoute] },
  { path: '/auth/sign-in', route: [SignIn.route, NotFound.backToHomeRoute] },
  { path: '/auth/forgot-password', route: [ForgotPassword.route, NotFound.backToHomeRoute] },
  { path: '/auth/reset-password', route: [ResetPassword.route, NotFound.backToHomeRoute] },

  { path: '/users', route: [Users.route] },

  { path: '/profile', route: [Profile.route] },
  { path: '/profile/update', route: [ProfileUpdate.route] },
  { path: '/404', route: NotFound.route }
]

export const controls = createRouterControls()
export const history = createBrowserHistory()
export const router = createHistoryRouter({ routes, controls })

router.setHistory(history)

const Router = createRoutesView({
  routes: [
    { route: SignUp.route, view: SignUp.Page },
    { route: SignIn.route, view: SignIn.Page },
    { route: ForgotPassword.route, view: ForgotPassword.Page },
    { route: ResetPassword.route, view: ResetPassword.Page },
    { route: Appointment.route, view: Appointment.Page, layout: Layout },
    { route: FindPractitioner.route, view: FindPractitioner.Page, layout: Layout },
    { route: Visit.route, view: Visit.Page, layout: Layout },
    { route: Profile.route, view: Profile.Page, layout: Layout },
    { route: ProfileUpdate.route, view: ProfileUpdate.Page, layout: Layout },
    { route: Users.route, view: Users.Page, layout: Layout }
  ],
  otherwise: () => <div>Page not found!</div>
})

export const App = () => {
  useEffect(() => {
    sample({ clock: getUserInfo.fail, target: SignIn.route.open })
    GET_USER_INFO()
  }, [])
  return <Router />
}

controls.$query.watch(query => {
  if ('confirmation-code' in query) {
    UPDATE_CONFIRMATION_CODE(query['confirmation-code'])
  }

  if ('reset-password-code' in query) {
    UPDATE_RECOVERY_CODE(query['reset-password-code'])
  }
})
