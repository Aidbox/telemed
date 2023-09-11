import clsx from 'clsx'
import { format } from 'date-fns'
import React from 'react'

import ProfileBase from '../../assets/avatar.png'
import { Message as IMessage } from '../../service/chat'
import { User } from '../../service/session'

import { Avatar } from './Avatar'
import css from './Chat.module.css'
interface Props {
  message: IMessage
  user: User
}

export const Message = ({ message, user }: Props) => {
  return (
    <div
      className={clsx(
        css.message,
        message.sender.id === user.link[0].link.id && css.reverse
      )}
    >
      <Avatar photo={ProfileBase} />
      <div className={css['message-inner']}>
        <div className={css.inner}>
          <div className={css.headers}>
            <span className={css.username}>
              {message.name.givenName + ' ' + message.name.familyName}
            </span>
            <span className={css.time}>
              {format(new Date(message.meta.createdAt), 'HH:mm')}
            </span>
          </div>
          <span className={css.text}>{message.body}</span>
        </div>
      </div>
    </div>
  )
}
