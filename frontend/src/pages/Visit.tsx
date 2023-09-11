import { createRoute } from 'atomic-router'
import { useUnit } from 'effector-react'
import React, { useEffect } from 'react'

import Breadcrumbs from '../components/Breadcrumbs'
// import { Tabs, Tab } from '../components/Layout/Tab'
import { Header } from '../components/Layout/Header'
import { Master, MasterDetailLayout } from '../components/Layout/MasterDetailLayout'
import VideoApp from '../components/TwilioVideo'
import { Session } from '../service/session'
import { GET_ENCOUNTER, FINISH_ENCOUNTER, START_ENCOUNTER, EncounterStore } from '../service/visit'

// import Chat from './Chat'
// import ConsultNote from './ConsultNote'

const route = createRoute<{ encounter: string }>()
const goToPostsRoute = createRoute<{ encounter: string }>()

export function Page () {
  const session = useUnit(Session)
  const encounterStore = useUnit(EncounterStore)
  const { encounter } = useUnit(route.$params)

  useEffect(() => { if (encounter) GET_ENCOUNTER(encounter) }, [encounter])

  // const isEncounterFinished = encounter?.status === 'finished'
  // const isPractitioner = user?.roleName === 'practitioner'

  // const saveConsultNoteHandler = (note) => {
  //   ctrl.saveConsultNote(encounter.id, encounter.consultNote.id, note)
  // }

  // if (isLoadingEncounter && !encounter?.id) {
  //   return <div>Loading...</div>
  // }

  const VideoCall = () => (
    <VideoApp
      user={session.user}
      roomName={encounter}
      finishEncounter={() => FINISH_ENCOUNTER(encounter)}
      startEncounter={() => START_ENCOUNTER(encounter)}
    />
  )

  if (!session.user) return <span />

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
        {!['cancelled', 'finished'].includes(encounterStore.status) && !encounterStore.loading && <VideoCall />}
        {encounterStore.loading && <div>Fetching encounter information...</div>}
        {encounterStore.status === 'finished' && <div>Encounter finished</div>}
        {encounterStore.status === 'cancelled' && <div>Encounter cancelled</div>}
      </Master>

      {/* {!isEncounterFinished && <Detail> */}
      {/*  <Tabs> */}

      {/*    {isPractitioner && encounter.consultNote && ( */}
      {/*      <Tab name='Consult Note'> */}
      {/*        <ConsultNote */}
      {/*          submit={saveConsultNoteHandler} */}
      {/*          value={encounter.consultNote?.description || ''} */}
      {/*          encounter={encounter} */}
      {/*        /> */}
      {/*      </Tab> */}
      {/*    )} */}
      {/*    <Tab name='Chat'> */}
      {/*      <Chat */}
      {/*        roomId={encounter.id} user={user} */}
      {/*        isVisit */}
      {/*      /> */}
      {/*    </Tab> */}

      {/*  </Tabs> */}
      {/* </Detail>} */}
    </MasterDetailLayout>
  )
}

export const Visit = {
  route,
  goToPostsRoute,
  Page
}
