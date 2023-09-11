import { Practitioner, HumanName, Patient } from 'aidbox/types'
import {
  format,
  differenceInYears,
  differenceInHours,
  differenceInMinutes
} from 'date-fns'
import { useUnit } from 'effector-react'
import React, { useEffect, useState, useMemo } from 'react'

import CalendarIcon from '../../assets/Calendar.svg'
import ClockIcon from '../../assets/Clock.svg'
import profile from '../../assets/profile-base.png'
import { Appointments, AppointmentStore, CANCEL_APPOINTMENT } from '../../service/appointment'
import { Session } from '../../service/session'
import { constructReadableName } from '../../utils'
// import Chat from '../../visit/components/Chat'
import Button from '../Button'
import Chat from '../Chat/Chat'
import { Tabs, Tab } from '../Layout/Tab'
import { Link } from '../Link'

import css from './Appointment.module.css'

const updateEncounterStatus = (encounterStartDate: Date) => {
  const currentDate = new Date()

  const encounterDifferenceInHours = differenceInHours(
    encounterStartDate,
    currentDate
  )

  const encounterDifferenceInMinutes = differenceInMinutes(
    encounterStartDate,
    currentDate
  )

  if (encounterDifferenceInMinutes < 0) {
    return {
      disabled: false,
      title: 'Join to the Video Call'
    }
  }

  if (encounterDifferenceInMinutes < 60) {
    return {
      // true
      disabled: false,
      title: `Video Call will start in ${
        encounterDifferenceInMinutes + 1
      } minutes.`
    }
  }

  if (encounterDifferenceInHours < 24) {
    return {
      // true
      disabled: false,
      title: `Video Call will start in ${encounterDifferenceInHours} hours.`
    }
  }

  if (encounterDifferenceInHours >= 23) {
    return {
      // true
      disabled: false,
      title: `Video Call will start ${format(encounterStartDate, 'dd MMMM')}.`
    }
  }
}

type Appointment = AppointmentStore['list'][0]

export function AppointmentDetails () {
  const session = useUnit(Session)
  const { list, selected } = useUnit(Appointments)

  const appointment = useMemo<Appointment | undefined>(
    () => list.find(item => item.id === selected), [list, selected])

  const encounterStartDate = useMemo(
    () => new Date(appointment?.start || ''), [appointment])

  const resource = useMemo<Patient | Practitioner | undefined>(() => {
    const role = session.user?.data.roleName

    if (appointment && role && role === 'patient') {
      return appointment.participant.practitioner
    }

    if (appointment && role && role === 'practitioner') {
      return appointment.participant.patient
    }
  }, [appointment, session.user])

  const name = useMemo<HumanName | undefined>(() => {
    if (resource) return resource.name?.[0]
  }, [resource])

  const [encounterStatus, setEncounterStatus] = useState(
    updateEncounterStatus(encounterStartDate)
  )

  const isAppointmentFulfilled = appointment?.status === 'fulfilled' || appointment?.status === 'cancelled'

  useEffect(() => {
    setEncounterStatus(updateEncounterStatus(encounterStartDate))

    const identificator = setInterval(
      () => setEncounterStatus(updateEncounterStatus(encounterStartDate)),
      1000 * 30
    )

    return () => clearInterval(identificator)
  }, [encounterStartDate, setEncounterStatus, appointment])

  if (!session.user || !appointment) return null

  const additionalInfo = (
    <div className={css.additionalInfo}>
      <p className='mb-1'>
        <CalendarIcon
          className='mr-2' height='18'
          width='18'
        />{' '}
        {format(encounterStartDate, 'dd/MM/yyyy')}
      </p>
      <p className='mb-1'>
        <ClockIcon
          className='mr-2' height='18'
          width='18'
        />{' '}
        {format(encounterStartDate, 'h:mm a')}
      </p>
      <hr />
      <p className='mb-0 font-weight-bold'>Chief Complaint</p>
      <p>N/A</p>
    </div>
  )

  return (
    <div className={[css.details].join(' ')}>
      <div className={css.badge}>
        <img
          className={css.profileImage} src={profile}
          alt='profile'
        />
        <div className={css.names}>
          <strong className={css['user-cell__name']}>
            {name ? constructReadableName(name) : 'N/A'}
          </strong>
          <span className={css.age}>
            {session.isPractitioner
              ? resource?.birthDate
                ? `${differenceInYears(
                  new Date(),
                  new Date(resource.birthDate)
                )} years old`
                : 'N/A'
              : null}
            {session.isPatient && 'Practitioner'}
          </span>
        </div>
      </div>

      <div style={{ marginTop: '20px', height: '90%' }}>
        <Tabs>
          <Tab name='Details'>
            {additionalInfo}

            {!isAppointmentFulfilled && (
              <Link to={!encounterStatus || encounterStatus?.disabled ? '' : `/visit/${appointment.encounterID}`}>
                <Button
                  disabled={encounterStatus?.disabled}
                  className={[css['appointments-details__button'], 'mb-2'].join(' ')}
                  variant='primary'
                >
                  {encounterStatus?.title}
                </Button>
              </Link>
             )}

            {!isAppointmentFulfilled && (
              <Button
                className={css['appointments-details__button']}
                variant='secondary'
                onClick={() => {
                  if (confirm('Cancel you appointment?')) {
                    CANCEL_APPOINTMENT()
                  }
                }}
              >
                Cancel appointment
              </Button>
             )}
          </Tab>

          <Tab name={'Chat'}>
            <Chat
              isActive
              roomId={appointment.encounterID}
              user={session.user}
            />
          </Tab>
        </Tabs>
      </div>
    </div>
  )
}
