import { createRoute, redirect } from 'atomic-router'
import { differenceInYears } from 'date-fns'
import format from 'date-fns/format'
import { useUnit } from 'effector-react'
import React, { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table'

import CalendarIcon from '../assets/Calendar.svg'
import ClockIcon from '../assets/Clock.svg'
import profile from '../assets/profile-base.png'
import RightArrowIcon from '../assets/RightArrow.svg'
import css from '../components/Appointment/Appointment.module.css'
import { Header } from '../components/Layout/Header'
import { Detail, Master, MasterDetailLayout } from '../components/Layout/MasterDetailLayout'
import { Encounter, EncountersStore, GET_ENCOUNTER_LIST } from '../service/encounter'
import { Session } from '../service/session'
import { finishEncounter } from '../service/visit'
import { constructReadableName } from '../utils'

const route = createRoute()

redirect({ clock: finishEncounter.done, route })

export function Page () {
  const session = useUnit(Session)
  const encounters = useUnit(EncountersStore)
  const [active, setActive] = useState<string>()
  const encounter = encounters.list.find(item => item.id === active)

  const resource = session.isPractitioner
    ? encounter?.participant.patient
    : encounter?.participant.practitioner

  console.log(resource)

  useEffect(() => {
    if (session.resource && session.resource.id) {
      GET_ENCOUNTER_LIST(session.resource)
    }
  }, [session.resource])

  return (
    <MasterDetailLayout>
      <Master>
        <Header>Encounters</Header>
        <Table>
          <tbody>
            {encounters.list.map((encounter) =>
              <TableRow
                key={encounter.id} encounter={encounter}
                selected={encounter.id === active}
                select={() => { if (encounter.id) setActive(encounter.id) }}
                role={session.user?.data.roleName}
              />
          )}
          </tbody>
        </Table>
      </Master>

      <Detail>
        <Header>Details</Header>
        {resource && <div className={[css.details].join(' ')}>
          <div className={css.badge}>
            <img
              className={css.profileImage} src={profile}
              alt='profile'
            />
            <div className={css.names}>
              <strong className={css['user-cell__name']}>
                {resource ? constructReadableName(resource.name?.[0]) : 'N/A'}
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

          <div className={css.additionalInfo}>
            <p className='mb-1'>
              <CalendarIcon
                className='mr-2' height='18'
                width='18'
              />{' '}
              {encounter && format(new Date(encounter.start), 'dd/MM/yyyy')}
            </p>
            <p className='mb-1'>
              <ClockIcon
                className='mr-2' height='18'
                width='18'
              />{' '}
              {encounter && format(new Date(encounter.start), 'h:mm a')}
            </p>
            <hr />
            <p className='mb-0 font-weight-bold'>Chief Complaint</p>
            <p>{encounter ? encounter.chiefComplaint : ''}</p>
          </div>
        </div>}
      </Detail>
    </MasterDetailLayout>
  )
}

const DateCell = ({ date }: { date: string | undefined }) => {
  const nativeDate = date ? new Date(date) : new Date()

  return (
    <td className={css['date-cell']}>
      <div>
        <div className={css['date-cell__date']}>
          <strong>{format(nativeDate, 'dd/MM/yyyy')}</strong>
        </div>

        <div className={css['date-cell__time']}>
          {format(nativeDate, 'h:mm a')}
        </div>
      </div>
    </td>
  )
}

interface Props {
  encounter: Encounter
  selected: boolean
  select: (id: string) => void
  role: 'patient' | 'practitioner' | 'admin' | undefined
}

const TableRow = ({ encounter, selected, select, role }: Props) => {
  return (
    <tr className={selected ? 'selected' : ''} onClick={() => select(encounter.id || '')}>
      <DateCell date={encounter.start} />

      <td className={css['user-cell']}>
        <div>
          <img
            className={css.profileImage} src={profile}
            alt='profile'
          />

          <div className={css['user-cell__content']}>
            <strong className={css['user-cell__name']}>
              {role === 'patient' && Boolean(encounter.participant.practitioner.name) ? constructReadableName(encounter.participant.practitioner.name?.[0]) : null}
              {role === 'practitioner' && Boolean(encounter.participant.patient.name) ? constructReadableName(encounter.participant.patient.name?.[0]) : null}
            </strong>

            <span className={[css['user-cell__role'], 'text-muted'].join(' ')}>
              {encounter.chiefComplaint}
            </span>
          </div>
        </div>
      </td>

      <td>{encounter.status}</td>

      <td>
        <div className={css.tdIcon}>
          <RightArrowIcon height='16' />
        </div>
      </td>
    </tr>
  )
}

export const Encounters = {
  route,
  Page
}
