import { Patient } from 'aidbox/types'
import { createRoute } from 'atomic-router'
import clsx from 'clsx'
import { useUnit } from 'effector-react'
import { useEffect } from 'react'

import { Header } from '../components/Layout/Header'
import css from '../components/User/Users.module.css'
import { GET_PATIENT_LIST, PatientsStore } from '../service/patients'

const route = createRoute()
const backToHomeRoute = createRoute()

export const Page = () => {
  const patients = useUnit(PatientsStore)

  const onClickHandler = (id: string) => {
    console.log(id)
    // history.push(`/report/encounters/${id}`);
  }

  useEffect(() => { GET_PATIENT_LIST() }, [])

  return (
    <div>
      <div>
        <Header>Report</Header>
      </div>
      {!patients.loading &&
        <table className={clsx(['table', css['users-table']])}>
          <tbody>
            {patients.list.map((user) => (
              <UserItem
                key={user.id}
                user={user}
                onClickHandler={onClickHandler}
              />
          ))}
          </tbody>
        </table>
      }
    </div>
  )
}

function UserItem ({ user, onClickHandler }: { user: Patient, onClickHandler: (id: string) => void}) {
  let userName

  if (user && user.name?.[0].given) {
    userName = `${user.name[0].given} ${user.name[0].family}`
  } else {
    userName = 'Name not found'
  }

  return (
    <tr
      onClick={() => { onClickHandler(user.id || '') }}
    >
      <td>{userName}</td>

      <td>{user.telecom && (user.telecom[0].value || 'Telecom email not found')}</td>

      <td>Patient</td>

    </tr>
  )
}

export const Report = {
  route,
  backToHomeRoute,
  Page
}
