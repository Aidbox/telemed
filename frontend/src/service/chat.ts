import { createEffect, createEvent, createStore, sample } from 'effector'

import { http, R } from './aidbox'
import { User } from './session'

export interface Chat {
  id: string,
  participant: Array<{ user: { id: string, name: { givenName: string, familyName: string } } }>
}

export interface IHistory {
  messages: Array<Message>
}

export interface Message {
  id: string,
  body: string,
  name: { givenName: string, familyName: string }
  sender: { id:string },
  meta: { createdAt: string, lastUpdated: string }
}

export const GET_META = createEvent()
export const GET_HISTORY = createEvent<{ user: User, roomId: string }>()
export const SEND_MESSAGE = createEvent<{ text: string, user: User, roomId: string }>()

export const History = createStore<IHistory>({ messages: [] })

const getHistory = createEffect<{ user: User, roomId: string }, R<{ messages: Array<{ resource: Message }>}>>(async (data) => {
  return http.get(`NodeChat/${data.roomId}/$get-messages`)
})

const sendMessage = createEffect<{ text: string, user: User, roomId: string }, unknown>(async (data) => {
  return http.post(
    `NodeChat/${data.roomId}/$create-messages`,
    { json: { message: data.text, userId: data.user.link[0].link, userName: data.user.name } })
})

History.on(getHistory.doneData, (s, { response }) => {
  return { messages: response.data.messages.map(({ resource }) => resource) }
})

sample({ clock: SEND_MESSAGE, target: sendMessage })
sample({ clock: GET_HISTORY, target: getHistory })
