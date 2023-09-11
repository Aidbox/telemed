import { createRoute } from 'atomic-router'
import { useUnit } from 'effector-react'
import React, { useEffect } from 'react'

import { Header } from '../components/Layout/Header'
import { Master, MasterDetailLayout } from '../components/Layout/MasterDetailLayout'
import UserInfo from '../components/Profile/UserInfo'
import Schedule from '../components/Schedule/Schedule'
import {
  GET_PRACTITIONER_SCHEDULE,
  Rules,
  UPDATE_PRACTITIONER_SCHEDULE,
  WeekDays
} from '../service/schedule'
import { Session } from '../service/session'

const route = createRoute()
const backToHomeRoute = createRoute()

const Page = () => {
  const session = useUnit(Session)
  const rules = useUnit(Rules)

  const saveRules = (rules: Array<{ daysOfWeek: [WeekDays], availableEndTime: string, availableStartTime: string, duration: number }>) => {
    if (session.resource) {
      UPDATE_PRACTITIONER_SCHEDULE({
        practitionerId: session.resource.id || '',
        rules
      })
    }
  }

  useEffect(() => {
    if (session.resource?.id) GET_PRACTITIONER_SCHEDULE(session.resource.id)
  }, [session.resource])

  return (
    <MasterDetailLayout>
      <Master>
        <Header>
          {session.isPatient && "Patient's Profile"}
          {session.isPractitioner && "Practitioner's Profile"}
        </Header>
        {session.user && session.resource && <UserInfo user={session.user} resource={session.resource} />}
        {session.isPractitioner && <Schedule rules={rules} onSave={saveRules} />}
      </Master>
    </MasterDetailLayout>
  )
}

// <div className={classes['availability-container']}>
//   {user.roleName === 'practitioner' && (
//     <Schedule user={user} rules={page.rules} onSave={controller.saveRules}
//               onFetch={controller.fetchRules} />
//   )}
// </div>

export const Profile = {
  route,
  backToHomeRoute,
  Page
}
