import { createEffect, createEvent, createStore, sample } from 'effector'

import { http, R } from './aidbox'
import { User } from './session'

export interface ChatList {
  loading: boolean
  list: Array<Chat>
}

export interface Chat {
  id: string
  cts: string
  status: 'closed' | 'active'
  lastMessage: [{ resource: Message }]
  unrearedMessages: null
  participant: Array<{
    name: { givenName: string, familyName: string }
    user: { id: string, name: { givenName: string, familyName: string } }
  }>
}

export interface IHistory {
  messages: Array<Message>
}

export interface Message {
  id: string
  cts: string
  body: string
  name: { givenName: string, familyName: string }
  sender: { id:string }
  meta: { createdAt: string, lastUpdated: string }
}

export const GET_META = createEvent()
export const GET_HISTORY = createEvent<{ user: User, roomId: string }>()
export const SEND_MESSAGE = createEvent<{ text: string, user: User, roomId: string }>()
export const GET_CHATS = createEvent<string>()

export const History = createStore<IHistory>({ messages: [] })
export const ChatsList = createStore<ChatList>({ loading: false, list: [] })

const getHistory = createEffect<{ user: User, roomId: string }, R<{ messages: Array<{ resource: Message }>}>>(async (data) => {
  return http.get(`NodeChat/${data.roomId}/$get-messages`)
})

const sendMessage = createEffect<{ text: string, user: User, roomId: string }, unknown>(async (data) => {
  return http.post(
    `NodeChat/${data.roomId}/$create-messages`,
    { json: { message: data.text, userId: data.user.link[0].link, userName: data.user.name } })
})

const getChatList = createEffect<string, R<{ data: Array<Chat>}>>(async (id: string) => {
  return await http.get(`NodeChat/${id}/$chats`)
})

History
  .on(getChatList.pending, (s, loading) => ({ ...s, ...(loading ? { messages: [] } : {}), loading }))
  .on(getHistory.doneData, (s, { response }) => {
    return { messages: response.data.messages.map(({ resource }) => resource) }
  })

ChatsList
  .on(getChatList.pending, (s, loading) => ({ ...s, loading }))
  .on(getChatList.doneData, (s, { response }) => {
    return { ...s, list: response.data.data }
  })

sample({ clock: SEND_MESSAGE, target: sendMessage })
sample({ clock: GET_HISTORY, target: getHistory })
sample({ clock: GET_CHATS, target: getChatList })
