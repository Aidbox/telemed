import format from 'date-fns/format'
import React from 'react'
import Table from 'react-bootstrap/Table'

import profile from '../../assets/profile-base.png'
import RightArrowIcon from '../../assets/RightArrow.svg'
import { AppointmentStore } from '../../service/appointment'
import { User } from '../../service/session'
import { constructReadableName } from '../../utils'

import css from './Appointment.module.css'

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
  items: AppointmentStore['list'],
  role: User['data']['roleName'] | undefined,
  selectAppointment: (id: string) => void,
  selectedAppointment: string | undefined,
  isShowStatus?: true
}

export const AppointmentsList = (props: Props) => {
  const { items, selectedAppointment, selectAppointment } = props

  return (
    <Table>
      <tbody>
        {items.map((appointment) =>
          <TableRow
            key={appointment.id} appointment={appointment}
            selected={appointment.id === selectedAppointment}
            select={() => { if (appointment.id) selectAppointment(appointment.id) }}
            role={props.role}
          />
        )}
      </tbody>
    </Table>
  )
}

interface RowProps {
  select: () => void,
  appointment: AppointmentStore['list'][0],
  selected: boolean,
  role: User['data']['roleName'] | undefined
}

const TableRow = ({ appointment, selected, select, role }: RowProps) => {
  return (
    <tr className={selected ? 'selected' : ''} onClick={select}>
      <DateCell date={appointment.start} />

      <td className={css['user-cell']}>
        <div>
          <img
            className={css.profileImage} src={profile}
            alt='profile'
          />

          <div className={css['user-cell__content']}>
            <strong className={css['user-cell__name']}>
              {role === 'patient' && Boolean(appointment.participant.practitioner.name) ? constructReadableName(appointment.participant.practitioner.name?.[0]) : null}
              {role === 'practitioner' && Boolean(appointment.participant.patient.name) ? constructReadableName(appointment.participant.patient.name?.[0]) : null}
            </strong>

            <span className={[css['user-cell__role'], 'text-muted'].join(' ')}>
              {appointment.chiefComplaint}
            </span>
          </div>
        </div>
      </td>

      <td>{appointment.status}</td>

      <td>
        <div className={css.tdIcon}>
          <RightArrowIcon height='16' />
        </div>
      </td>
    </tr>
  )
}
