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
      if (typeof room.removeListener === 'function') room.removeListener('participantConnected', participantConnected)
      if (typeof room.removeListener === 'function') room.removeListener('participantDisconnected', participantDisconnected)
    }
  }, [room])

  return participants
}
