import { createRoute, redirect } from 'atomic-router'
import { useUnit } from 'effector-react'
import { useEffect, useMemo, useState } from 'react'

import AddIcon from '../assets/Add.svg'
import css from '../components/Appointment/Appointment.module.css'
import { AppointmentDetails } from '../components/Appointment/Details'
import { AppointmentsList } from '../components/Appointment/List'
import { Header } from '../components/Layout/Header'
import { Detail, Master, MasterDetailLayout } from '../components/Layout/MasterDetailLayout'
import { Tabs, Tab } from '../components/Layout/Tab'
import { Link } from '../components/Link'
import {
  Appointments,
  AppointmentStore,
  AppointmentsHistory, GET_APPOINTMENT_HISTORY,
  GET_APPOINTMENT_LIST
} from '../service/appointment'
import { Session } from '../service/session'
import { finishEncounter } from '../service/visit'

const route = createRoute()
const goToPostsRoute = createRoute()

redirect({ clock: finishEncounter.done, route })

export function Page () {
  const session = useUnit(Session)
  const appointments = useUnit(Appointments)
  const appointmentsHistory = useUnit(AppointmentsHistory)
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    if (session.resource && session.resource.id) {
      GET_APPOINTMENT_LIST(session.resource)
      GET_APPOINTMENT_HISTORY(session.resource)
    }
  }, [session.resource])

  const appointment = useMemo<AppointmentStore['list'][0] | undefined>(() => {
    return appointments.list.find(item => item.id === active) ||
      appointmentsHistory.list.find(item => item.id === active)
    }, [active, appointments, appointmentsHistory])

  return (
    <MasterDetailLayout>
      <Master>
        <Header>Appointments</Header>
        {session.isPatient && <ScheduleConversationLink />}

        <Tabs>
          <Tab name='Appointments'>
            <AppointmentsList
              selectAppointment={setActive}
              selectedAppointment={active}
              items={appointments.list}
              role={session.user?.data.roleName}
            />
          </Tab>

          <Tab name='History'>
            <AppointmentsList
              selectAppointment={setActive}
              selectedAppointment={active}
              items={appointmentsHistory.list}
              role={session.user?.data.roleName}
            />
          </Tab>
        </Tabs>
      </Master>

      <Detail>
        <Header>Details</Header>
        {appointment !== undefined && <AppointmentDetails appointment={appointment} />}
      </Detail>
    </MasterDetailLayout>
  )
}

const ScheduleConversationLink = () => {
  return (
    <Link className={css.appointments__link} to='/find-practitioner'>
      <AddIcon height='32' />
      Schedule a new consultation
    </Link>
  )
}

export const Appointment = {
  route,
  goToPostsRoute,
  Page
}
