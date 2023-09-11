import React from 'react'

import Button from '../../../../Button'
import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle'
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext'
import MicIcon from '../../../icons/MicIcon'
import MicOffIcon from '../../../icons/MicOffIcon'

export default function ToggleAudioButton (props) {
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle()
  const { localTracks } = useVideoContext()
  const hasAudioTrack = localTracks.some((track) => track.kind === 'audio')

  return (
    <Button
      size='sm'
      onClick={toggleAudioEnabled}
      disabled={!hasAudioTrack || props.disabled}
      icon={isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
      data-cy-audio-toggle
    >
      {!hasAudioTrack ? 'No Audio' : isAudioEnabled ? 'Mute' : 'Unmute'}
    </Button>
  )
}
