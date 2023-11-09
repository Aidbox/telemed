// import { Practitioner, Patient } from 'aidbox/types'
import clsx from 'clsx'
import { format } from 'date-fns'

import profile from '../../assets/profile-base.png'
import { ChatList } from '../../service/chat'

import css from './Chat.module.css'

interface Props {
  data: ChatList['list']
  selectChat: (id: string) => void
  getInterlocutor: (participant: ChatList['list'][0]['participant']) => ChatList['list'][0]['participant'][0]
  selectedChat: string | undefined
}

export default function ChatsRowContainer ({ data, getInterlocutor, selectChat, selectedChat }: Props) {
  return (
    <div style={{ overflow: 'scroll', display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
      {(data || []).map(item => {
        const interlocutor = getInterlocutor(item.participant)
        const lastMessage = item.lastMessage?.[0]?.resource
        const lastMessageText = lastMessage?.body
        const lastMessageTime = lastMessage?.cts
        const interlocutorName = interlocutor?.name.givenName + ' ' + interlocutor?.name.familyName
        return (
          <div
            key={item.id}
            onClick={() => selectChat(item.id)}
            className={clsx([css.rowContainer, selectedChat === item.id ? css.rowSelected : css.rowDefault])}
          >
            <div className={css.row} onClick={() => selectChat(item.id)}>
              <div style={{ padding: 6, marginRight: 16 }}>
                <img
                  className={css.profileImage}
                  src={profile}
                  alt='profile'
                />
              </div>
              <div>
                <h6 style={{ margin: 0 }}>{interlocutorName}</h6>
                <p className={css.textrow}>{lastMessageText || 'No messages yet'}</p>
              </div>
            </div>
            <div style={{ marginRight: '6px' }}>
              <p className={css.lastMessageTime}>{lastMessageTime ? format(new Date(lastMessageTime), 'HH:mm') : ''}</p>
              {(item.unrearedMessages || 0) > 0 &&
                <div className={css.unreadMessageContainer}>
                  <p className={css.unreadMessage}>{item.unrearedMessages}</p>
                </div>
              }
            </div>
          </div>
        )
      })}
    </div>
  )
}
