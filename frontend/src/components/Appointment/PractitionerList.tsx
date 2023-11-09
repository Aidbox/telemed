import { Practitioner } from 'aidbox/types'
import React from 'react'
import Table from 'react-bootstrap/Table'

import profile from '../../assets/profile-base.png'
import { constructReadableName } from '../../utils'

import css from './FindPractitioner.module.css'

interface Props {
  list: Array<Practitioner>,
  selected: string | undefined,
  select: (id: string | undefined) => void
}

const getSpeciality = (data: Practitioner['qualification']) => {
  const speciality = data?.[0]
  return speciality?.code.text || 'unknown'
}

export const PractitionerList = ({ list, selected, select }: Props) => {
  return (
    <Table className='table'>
      <tbody>
        {(list || []).map((resource) => (
          <tr
            className={selected === resource.id ? 'selected' : ''}
            onClick={() => select(resource.id)}
            key={resource.id}
          >
            <td>
              <div className={css.row}>
                <img
                  className={css.profileImage} src={profile}
                  alt='profile'
                />
                <div className={css.names}>
                  <span className={css.name}>
                    {resource?.name?.[0] ? constructReadableName(resource?.name?.[0]) : 'N/A'}
                  </span>
                  <span className={[css.spec, 'text-muted'].join(' ')}>
                    {getSpeciality(resource.qualification)}
                  </span>
                </div>
              </div>
            </td>
          </tr>
      ))}
      </tbody>
    </Table>
  )
}
