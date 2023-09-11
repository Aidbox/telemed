import React, { createContext } from 'react'

import useLocalTracks from './useLocalTracks/useLocalTracks'
import useRoom from './useRoom/useRoom'
import { SelectedParticipantProvider } from './useSelectedParticipant/useSelectedParticipant'

export const VideoContext = createContext(null)

export function VideoProvider ({ options, children, onError = () => {} }) {
  const onErrorCallback = (error) => {
    // eslint-disable-next-line no-console
    console.log(`ERROR: ${error.message}`, error)
    onError(error)
  }
  const {
    localTracks,
    getLocalVideoTrack,
    getLocalAudioTrack,
    isAcquiringLocalTracks,
    removeLocalVideoTrack,
    removeLocalAudioTrack,
    getAudioAndVideoTracks
  } = useLocalTracks()
  const { room, isConnecting, connect } = useRoom(
    localTracks,
    onErrorCallback,
    options
  )
  return (
    <VideoContext.Provider
      value={{
        room,
        localTracks,
        isConnecting,
        onError: onErrorCallback,
        getLocalVideoTrack,
        getLocalAudioTrack,
        connect,
        isAcquiringLocalTracks,
        removeLocalVideoTrack,
        removeLocalAudioTrack,
        getAudioAndVideoTracks
      }}
    >
      <SelectedParticipantProvider room={room}>
        {children}
      </SelectedParticipantProvider>
    </VideoContext.Provider>
  )
}
