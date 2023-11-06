import { createRoute, redirect } from 'atomic-router'
import { useUnit } from 'effector-react'
import { useEffect } from 'react'

import AddIcon from '../assets/Add.svg'
import css from '../components/Appointment/Appointment.module.css'

// import { isAfter, startOfDay } from 'date-fns'
// import React, { useState } from 'react'

// import { useController } from '../../../../lib/components/ControllerLayer'
// import { useStore } from '../../../../lib/components/StoreLayer'
// import { Tabs, Tab } from '../../../components/Collection/Tabs'
// import { Header } from '../../../components/Header'
// import AddIcon from '../../../components/icons/AddIcon'
// import {
//   Detail,
//   Master,
//   MasterDetailLayout
// } from '../../../components/MasterDetailLayout'
// import { Link } from '../../../components/Router'
// import { AppointmentController } from '../AppointmentController'

// import { AppointmentDetails } from './AppointmentDetails'
// import classes from './Appointment.module.css'
// import { AppointmentsList } from './AppointmentsList'

import { AppointmentDetails } from '../components/Appointment/Details'
import { AppointmentsList } from '../components/Appointment/List'
import { Header } from '../components/Layout/Header'
import { Detail, Master, MasterDetailLayout } from '../components/Layout/MasterDetailLayout'
import { Tabs, Tab } from '../components/Layout/Tab'
import { Link } from '../components/Link'
import {
  Appointments,
  AppointmentsHistory, GET_APPOINTMENT_HISTORY,
  GET_APPOINTMENT_LIST,
  SELECT_APPOINTMENT,
  SELECT_APPOINTMENT_FROM_HISTORY
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
  // const [{ isLoading, data }] = useStore((state) => state.page)
  // const [user] = useStore((state) => state.user)
  // const [selectedAppointment, selectAppointment] = useState()
  // const isPatient = user.roleName === 'patient'
  // const isPractitioner = user.roleName === 'practitioner'
  // const ctrl = useController(AppointmentController)
  //
  // const deleteAppointment = async (id) => {
  //   await ctrl.deleteAppointments(id)
  //   selectAppointment(null)
  // }
  //
  // const isFinished = (appointment) =>
  //   appointment.status === 'finish' || appointment.status === 'fulfilled'
  //
  // const isAfterDate = (appointment) => {
  //   return isAfter(startOfDay(new Date()), new Date(appointment.start))
  // }
  //
  // const isActive = (appointment) =>
  //   !isFinished(appointment) && !isAfterDate(appointment)
  //
  // const isNotActive = (appointment) => !isActive(appointment)
  //
  // const activeAppointment = data?.filter(isActive).reverse() || []
  //
  // const notActiveAppointment = data?.filter(isNotActive) || []

  useEffect(() => {
    if (session.resource && session.resource.id) {
      GET_APPOINTMENT_LIST(session.resource)
      GET_APPOINTMENT_HISTORY(session.resource)
    }
  }, [session.resource])

  return (
    <MasterDetailLayout>
      <Master>
        <Header>Appointments</Header>
        {session.isPatient && <ScheduleConversationLink />}

        <Tabs>
          <Tab name='Appointments'>
            <AppointmentsList
              selectAppointment={SELECT_APPOINTMENT}
              selectedAppointment={appointments.selected}
              items={appointments.list}
              role={session.user?.data.roleName}
            />
          </Tab>

          <Tab name='History'>
            <AppointmentsList
              selectAppointment={SELECT_APPOINTMENT_FROM_HISTORY}
              selectedAppointment={appointmentsHistory.selected}
              items={appointmentsHistory.list}
              role={session.user?.data.roleName}
            />
          </Tab>
        </Tabs>
      </Master>

      <Detail>
        <Header>Details</Header>
        <AppointmentDetails />
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
