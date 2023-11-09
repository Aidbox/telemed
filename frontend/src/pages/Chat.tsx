import { createRoute } from 'atomic-router'
import { useUnit } from 'effector-react'
import React, { useEffect, useState } from 'react'

import ProfileBase from '../assets/avatar.png'
import ChatComponent from '../components/Chat/Chat'
import ChatsRowContainer from '../components/Chat/ChatListRow'
import { Header } from '../components/Layout/Header'
import { Master, MasterDetailLayout } from '../components/Layout/MasterDetailLayout'
import { Tab, Tabs } from '../components/Layout/Tab'
import { ChatList, ChatsList, GET_CHATS, GET_HISTORY } from '../service/chat'
import { Session } from '../service/session'

const route = createRoute()
const backToHomeRoute = createRoute()

const Page = () => {
  const [active, setActive] = useState<string>()
  const session = useUnit(Session)
  const chats = useUnit(ChatsList)

  const getInterlocutor = (participants: ChatList['list'][0]['participant']) => {
    return participants.filter((item) => item.user.id !== session.user?.id)[0]
  }

  const chat = chats.list.find(chat => chat.id === active)

  const name = (() => {
    if (!chat) return ''

    const interlocutor = getInterlocutor(chat.participant)
    return interlocutor?.name.givenName + ' ' + interlocutor?.name.familyName
  })()

  useEffect(() => { if (session.resource) GET_CHATS(session.resource?.id || '') }, [session.resource])
  useEffect(() => { if (session.user && active) GET_HISTORY({ user: session.user, roomId: active }) }, [active])

  if (!session.user) return

  return (
    <MasterDetailLayout>
      <Master>
        <Header>Chats</Header>
        <div style={{ display: 'flex', height: 'calc(100% - 50px)' }}>
          <div style={{ width: '30%', padding: '0 20px', borderRight: '2px solid rgba(0, 0, 0, 0.2)' }}>
            <Tabs>
              <Tab name='Active'>
                <ChatsRowContainer
                  data={chats.list.filter(item => item.status === 'active')} getInterlocutor={getInterlocutor}
                  selectChat={setActive} selectedChat={active}
                />
              </Tab>

              <Tab name='Closed'>
                <ChatsRowContainer
                  data={chats.list.filter(item => item.status === 'closed')} getInterlocutor={getInterlocutor}
                  selectChat={setActive} selectedChat={active}
                />
              </Tab>
            </Tabs>
          </div>

          <div style={{ width: '70%', padding: '0 20px' }}>
            {active && <ChatHeader name={name} />}
            {active && (
              <ChatComponent
                isActive={chat?.status === 'active'} roomId={active}
                user={session.user}
              />)}

            {!active && <Placeholder />}
          </div>
        </div>
      </Master>
    </MasterDetailLayout>
  )
}

const ChatHeader = ({ name }: { name: string }) => {
  return <div
    style={{
    backgroundColor: 'var(--bgColor)',
    padding: '10px 5px',
    marginBottom: 15,
    display: 'flex',
    borderRadius: 'var(--borderRadius)',
    justifyItems: 'center'
    }}
         >
    <div style={{ marginRight: '0.75rem', borderRadius: '50%', overflow: 'hidden' }}>
      <img
        style={{ width: 48, height: 48 }} alt='profile photo'
        src={ProfileBase}
      />
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '1.25rem' }}>
      {name}
    </div>
  </div>
}

const Placeholder = () => {
  return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ whiteSpace: 'nowrap' }}>select a chat to start messaging</div>
  </div>
}

export const Chat = {
  route,
  backToHomeRoute,
  Page
}
