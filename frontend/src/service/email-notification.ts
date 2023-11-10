import { createEffect, createEvent, createStore, sample } from 'effector'

import { http } from './aidbox'

export interface Notification {
  id: string
  to: string
  status: string
  subject: string
  error: { message: string | { message: string } }
}

export interface NotificationListStore {
  loading: boolean,
  error: undefined,
  selected: string | undefined,
  list: Array<Notification>
}

export const NotificationStore = createStore<NotificationListStore>({ loading: false, error: undefined, selected: undefined, list: [] })

export const GET_NOTIFICATION_LIST = createEvent()

const getNotificationList = createEffect(async () => {
  const test = await http.get<{entry: Array<{ resource: Notification }>}>('EmailNotification')
  return test.response.data
})

NotificationStore
  .on(getNotificationList.pending, (s, loading) => ({ ...s, loading }))
  .on(getNotificationList.doneData, (s, { entry }) => ({ ...s, list: entry.map(({ resource }) => resource), loading: false }))

sample({ clock: GET_NOTIFICATION_LIST, target: getNotificationList })
