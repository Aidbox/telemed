import clsx from 'clsx'
import React, { memo } from 'react'

import CancelIcon from '../../assets/CancelIcon.svg'
import { User } from '../../service/session'

import classes from './Users.module.css'
interface Props {
  users: Array<User>, remove: (id: string) => void, select:(user: User) => void, selected: User | null
}
export function Component ({ users, remove, select, selected }: Props) {
  return (
    <table className={clsx(['table', classes['users-table']])}>
      <tbody>
        {(users || []).map((user) => (
          <UserTableRow
            key={user.id} user={user}
            select={select} remove={remove}
            selected={selected}
          />
      ))}
      </tbody>
    </table>
  )
}

interface RowProps {
  user: User, remove: (id: string) => void, select:(user: User) => void, selected: User | null
}

function UserTableRow ({ user, remove, select, selected }: RowProps) {
  const username = composeUsername(user)
  const onRemoveHandler = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
    event.stopPropagation()
    remove(user.id)
  }

  const rowActive = selected?.id === user.id

  return (
    <tr onClick={() => select(user)} className={rowActive ? classes['row-active'] : ''}>
      <td>{username}</td>

      <td>{user.email || 'Email not specified'}</td>

      <td>{user.data.roleName || 'Role not specified'}</td>

      <td>
        {user.data.roleName !== 'admin' && (
          <CancelIcon
            height='24' className={classes['users-table__cancel-icon']}
            onClick={onRemoveHandler}
          />
        )}
      </td>
    </tr>
  )
}

function composeUsername (user: User) {
  if (user.name?.givenName && user.name?.familyName) {
    return `${user.name.givenName} ${user.name.familyName}`
  } else if (user.link?.[0]?.link?.display) {
    return user.link[0].link.display
  } else {
    return 'Name not found'
  }
}

export const UsersList = memo(Component)
