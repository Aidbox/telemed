import { createRoute } from 'atomic-router'
import clsx from 'clsx'
import { useUnit } from 'effector-react'
import React, { useEffect, useState } from 'react'

import { Header } from '../components/Layout/Header'
import { Master, MasterDetailLayout } from '../components/Layout/MasterDetailLayout'
import css from '../components/User/Users.module.css'
import { GET_NOTIFICATION_LIST, Notification, NotificationStore } from '../service/email-notification'

const route = createRoute()
const backToHomeRoute = createRoute()

export const Page = () => {
  const notifications = useUnit(NotificationStore)
  const [selectedRow, selectRow] = useState<string>()

  // const selectRow = (id) => {
  //   rowP === id ? setRow(null) : setRow(id)
  // }

  useEffect(() => { GET_NOTIFICATION_LIST() }, [])

  if (notifications.loading) return <div>Loading...</div>

  return (
    <MasterDetailLayout>
      <Master>
        <Header>Email Notification</Header>
        <div style={{ width: '60%' }}>
          <table className={clsx(['table', css['users-table']])}>
            <tbody>
              {notifications.list.map((notification, key) => (<CreateRow
                notification={notification} selectRow={selectRow}
                selectedRow={selectedRow} key={key}
                                                              />
            ))}
            </tbody>
          </table>
        </div>
      </Master>
    </MasterDetailLayout>
  )
}

interface RowProps { selectRow: (id: string) => void, selectedRow: string | undefined, notification: Notification }

const getError = (error: Notification['error']) => {
  if (typeof error?.message === 'string') return error?.message
  if (typeof error?.message?.message === 'string') return error?.message?.message
  return 'ok'
}

const CreateRow = ({ notification, selectRow, selectedRow }: RowProps) => {
  const activeRow = selectedRow === notification.id
  const rowClass = activeRow ? 'table-row-active' : 'table-row'
  return (
    <tr className={ css[rowClass] } onClick={ () => selectRow(notification.id) }>

      <td className={css['table-col']}>{ notification?.to || '一' }</td>

      <td className={css['table-col']}>{ notification?.status || '一' }</td>

      <td className={css['table-col']}>
        {notification.status !== 'in-queue' && <p style={{ padding: '0 20px', margin: 0 }}>
          {getError(notification.error)}
        </p>}
      </td>

      <td className={css['table-col']}>{ notification?.subject || '一' }</td>
    </tr>
  )
}

export const EmailNotification = {
  route,
  backToHomeRoute,
  Page
}
