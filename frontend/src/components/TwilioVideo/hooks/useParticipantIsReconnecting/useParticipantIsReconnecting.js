import { useEffect, useState } from 'react'

export default function useParticipantIsReconnecting (participant) {
  const [isReconnecting, setIsReconnecting] = useState(false)

  useEffect(() => {
    const handleReconnecting = () => setIsReconnecting(true)
    const handleReconnected = () => setIsReconnecting(false)

    handleReconnected()

    participant.on('reconnecting', handleReconnecting)
    participant.on('reconnected', handleReconnected)
    return () => {
      participant.removeListener('reconnecting', handleReconnecting)
      participant.removeListener('reconnected', handleReconnected)
    }
  }, [participant])

  return isReconnecting
}
