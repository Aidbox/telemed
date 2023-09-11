import { useEffect, useState } from 'react'

import useVideoContext from '../useVideoContext/useVideoContext'

export default function useParticipants () {
  const { room } = useVideoContext()
  const [participants, setParticipants] = useState(
    Array.from(room.participants.values())
  )

  useEffect(() => {
    const participantConnected = (participant) =>
      setParticipants((prevParticipants) => [...prevParticipants, participant])
    const participantDisconnected = (participant) =>
      setParticipants((prevParticipants) =>
        prevParticipants.filter((p) => p !== participant)
      )
    room.on('participantConnected', participantConnected)
    room.on('participantDisconnected', participantDisconnected)
    return () => {
      if (typeof room.off === 'function') room.off('participantConnected', participantConnected)
      if (typeof room.off === 'function') room.off('participantDisconnected', participantDisconnected)
    }
  }, [room])

  return participants
}
