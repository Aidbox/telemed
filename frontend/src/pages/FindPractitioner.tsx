import { createRoute, redirect } from 'atomic-router'
import { useUnit } from 'effector-react'
import React, { useState, useEffect } from 'react'

import { FindPractitionerDetails } from '../components/Appointment/PractitionerDetail'
import { PractitionerList } from '../components/Appointment/PractitionerList'
import Breadcrumbs from '../components/Breadcrumbs'
import { Header } from '../components/Layout/Header'
import { Detail, Master, MasterDetailLayout } from '../components/Layout/MasterDetailLayout'
import {
  createAppointment,
  GET_PRACTITIONER_LIST,
  GET_PRACTITIONER_SCHEDULE,
  Practitioners
} from '../service/appointment'

import { Appointment } from './Appointment'

const route = createRoute()
const goToPostsRoute = createRoute()

redirect({ clock: createAppointment.done, route: Appointment.route })

export function Page () {
  const practitioners = useUnit(Practitioners)
  const [selectedPractitioner, selectPractitioner] = useState<string | undefined>(undefined)

  useEffect(() => { GET_PRACTITIONER_LIST() }, [])
  useEffect(() => { if (!selectedPractitioner) selectPractitioner(practitioners.list[0]?.id || undefined) }, [practitioners])
  useEffect(() => { if (selectedPractitioner) GET_PRACTITIONER_SCHEDULE(selectedPractitioner) }, [selectedPractitioner])

  return (
    <MasterDetailLayout>
      <Master>
        <Breadcrumbs
          list={[
            { name: 'Appointments', active: false, path: '/' },
            { name: 'New Appointment', active: true, path: '' }
          ]}
        />

        <Header>Find a doctor</Header>

        <PractitionerList
          list={practitioners.list}
          select={selectPractitioner}
          selected={selectedPractitioner}
        />
      </Master>
      <Detail>
        <Header>Book an appointment</Header>
        <FindPractitionerDetails
          practitioner={practitioners.list.find(item => item.id === selectedPractitioner)}
        />
      </Detail>
    </MasterDetailLayout>
  )
}

export const FindPractitioner = {
  route,
  goToPostsRoute,
  Page
}
