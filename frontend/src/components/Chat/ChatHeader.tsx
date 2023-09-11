import React, { useEffect, useState } from 'react'

import { Chat } from '../../service/chat'
import { User } from '../../service/session'

import { Avatar } from './Avatar'
import classes from './Chat.module.css'

interface Props {
  roomId: string,
  user: User
}

const ChatHeader = ({ roomId, user }: Props) => {
  const [chat] = useState<Chat>()
  useEffect(() => {
    // chatController.getChat(roomId).then((res) => {
    //   setChat(res.data)
    // })
  }, [roomId, user])

  const interlocutor = (chat?.participant || []).filter((participant) => participant?.user.id !== user.link[0].link.id)

  const interlocutorName = () => {
    return interlocutor?.[0]?.user.name?.givenName && interlocutor?.[0]?.user.name?.familyName
      ? interlocutor?.[0]?.user.name?.givenName + ' ' + interlocutor?.[0]?.user.name?.familyName
      : 'Loading...'
  }

  return (
    <div className={classes.header} >
      <div>
        <Avatar photo='src/assets/avatar.jpg' />
      </div>
      <div className={classes['header-container']}>
        <h5 className={classes['header-name']}>
          {interlocutorName()}
        </h5>
      </div>
    </div>
  )
}

export default ChatHeader
