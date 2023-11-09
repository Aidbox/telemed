import { createRoute } from 'atomic-router'
import { useUnit } from 'effector-react'
import React, { useEffect } from 'react'

import ProfileBase from '../assets/avatar.png'
import Breadcrumbs from '../components/Breadcrumbs'
import ChatComponent from '../components/Chat/Chat'
import { Header } from '../components/Layout/Header'
import { Detail, Master, MasterDetailLayout } from '../components/Layout/MasterDetailLayout'
import { Tab, Tabs } from '../components/Layout/Tab'
import VideoApp from '../components/TwilioVideo'
import { Session } from '../service/session'
import { GET_ENCOUNTER, FINISH_ENCOUNTER, START_ENCOUNTER, EncounterStore } from '../service/visit'

const route = createRoute<{ encounter: string }>()
const goToPostsRoute = createRoute<{ encounter: string }>()

export function Page () {
  const session = useUnit(Session)
  const encounterStore = useUnit(EncounterStore)
  const { encounter } = useUnit(route.$params)

  useEffect(() => { if (encounter) GET_ENCOUNTER(encounter) }, [encounter])

  const VideoCall = () => (
    <VideoApp
      user={session.user}
      roomName={encounter}
      finishEncounter={() => FINISH_ENCOUNTER(encounter)}
      startEncounter={() => START_ENCOUNTER(encounter)}
    />
  )

  if (!session.user) return <span />

  const name = () => {
    if (session.isPatient && encounterStore.practitioner) {
      const humanName = encounterStore.practitioner.name?.[0]
      return humanName?.given?.[0] + ' ' + humanName?.family
    }

    if (session.isPractitioner && encounterStore.patient) {
      const humanName = encounterStore.patient.name?.[0]
      return humanName?.given + ' ' + humanName?.family?.[0]
    }

    return 'loading...'
  }

  return (
    <MasterDetailLayout>
      <Master>
        <Breadcrumbs
          list={[
            { name: 'Appointments', active: false, path: '/' },
            { name: 'Visit', active: true, path: '' }
          ]}
        />
        <Header>Online Consultation</Header>
        <div style={{ height: '85%' }}>
          {!['cancelled', 'finished'].includes(encounterStore.status) && !encounterStore.loading && <VideoCall />}
          {encounterStore.loading && <div>Fetching encounter information...</div>}
          {encounterStore.status === 'finished' && <div>Encounter finished</div>}
          {encounterStore.status === 'cancelled' && <div>Encounter cancelled</div>}
        </div>

      </Master>

      <Detail>
        <Tabs>
          <Tab name='Chat'>
            {encounterStore.id && (
              <div style={{ height: 'calc(100% - 68px)' }}>
                <ChatHeader name={name()} />
                <ChatComponent
                  isActive roomId={encounterStore.id}
                  user={session.user}
                />
              </div>
            )}
          </Tab>
        </Tabs>
      </Detail>
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

export const Visit = {
  route,
  goToPostsRoute,
  Page
}
