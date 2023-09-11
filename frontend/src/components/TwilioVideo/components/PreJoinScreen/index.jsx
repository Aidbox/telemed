import React, { useEffect } from 'react'

import Button from '../../../Button'
import useVideoContext from '../../hooks/useVideoContext/useVideoContext'
import ToggleAudioButton from '../Buttons/ToggleAudioButton/ToggleAudioButton'
import ToggleVideoButton from '../Buttons/ToggleVideoButton/ToggleVideoButton'
import { useAppState } from '../State'

import classes from './index.module.css'
import LocalVideoPreview from './LocalVideoPreview/LocalVideoPreview'

export default function PreJoinScreen ({
  user,
  roomName,
  finishEncounter,
  startEncounter
}) {
  const { getToken, isFetching } = useAppState()
  const {
    connect,
    isAcquiringLocalTracks,
    isConnecting,
    getAudioAndVideoTracks
  } = useVideoContext()

  const disableButtons = isFetching || isAcquiringLocalTracks || isConnecting

  useEffect(() => {
    getAudioAndVideoTracks().catch((error) => {
      // eslint-disable-next-line no-console
      console.log('Error acquiring local media:')
      // eslint-disable-next-line no-console
      console.dir(error)
    })
  }, [getAudioAndVideoTracks])

  const participantFullName = `${user.name?.givenName} ${user.name?.familyName}`
  const participantIdentity = `${user.id}:${participantFullName}`

  const handleJoin = () => {
    getToken(participantIdentity, roomName)
      .then((token) => connect(token))
      .then(() => startEncounter())
  }

  return (
    <div className={classes.content}>
      <div className={classes.localPreviewContainer}>
        <LocalVideoPreview identity={participantFullName} />
      </div>
      <div className={classes.buttonGroup}>
        <ToggleVideoButton disabled={disableButtons} />
        <ToggleAudioButton disabled={disableButtons} />
        <Button
          variant='primary'
          onClick={handleJoin}
          disabled={disableButtons}
        >
          Join
        </Button>
        {user.roleName !== 'patient' && (
          <Button
            variant='danger' onClick={finishEncounter}
            disabled={false}
          >
            Finish the appointment
          </Button>
        )}
      </div>
    </div>
  )
}
