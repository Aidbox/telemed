import React, { useRef, useEffect, memo } from 'react'

import { Message as IMessage } from '../../service/chat'
import { User } from '../../service/session'

import classes from './Chat.module.css'
import { Message } from './Message'

interface Props {
  messages: Array<IMessage>
  user: User
}

const Component = ({ messages, user }: Props) => {
  const messageListReference: React.LegacyRef<HTMLDivElement> = useRef(null)

  useEffect(() => { scrollToEnd() }, [messages, user])

  const scrollToEnd = () => {
    const { current: node } = messageListReference

    if (node?.scrollTo) {
      node.scrollTo(0, node.scrollHeight)
    }
  }

  return (
    <div ref={messageListReference} className={classes['message-list']}>
      {messages?.map((message) => (
        <Message
          message={message} user={user}
          key={message.id}
        />
      ))}
    </div>
  )
}

const areEqual = (prev: Props, next: Props) => {
  return prev.messages === next.messages && prev.user === next.user
}

export const MessageList = memo(Component, areEqual)
