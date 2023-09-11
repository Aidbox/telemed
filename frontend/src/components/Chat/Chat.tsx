import { useUnit } from 'effector-react'
import React, { useEffect } from 'react'

import { GET_HISTORY, History, SEND_MESSAGE } from '../../service/chat'
import { User } from '../../service/session'

import ChatHeader from './ChatHeader'
import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'

interface Props {
  roomId: string,
  user: User,
  isActive: boolean,
  isVisit?: boolean
}

export default function Chat ({ roomId, user, isActive = true, isVisit = false }: Props) {
  const { messages } = useUnit(History)

  useEffect(() => {
    const identifier = setInterval(() => GET_HISTORY({ user, roomId }), 1000)
    return () => clearInterval(identifier)
  }, [roomId, user])

  const sendMessage = (text: string) => {
    SEND_MESSAGE({ text, user, roomId })
  }

  console.log(messages)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 'calc(100% - 64px)'
      }}
    >
      {isVisit && <ChatHeader roomId={roomId} user={user} />}
      <MessageList messages={messages} user={user} />
      {isActive && <MessageInput onSend={sendMessage} />}
    </div>
  )
}
