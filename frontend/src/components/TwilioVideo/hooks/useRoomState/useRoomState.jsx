import EventEmitter from 'events'

import { useEffect, useState } from 'react'

import useVideoContext from '../useVideoContext/useVideoContext'

export default function useRoomState () {
  const { room } = useVideoContext()
  const [state, setState] = useState('disconnected')

  useEffect(() => {
    const setRoomState = () => setState(room.state || 'disconnected')
    setRoomState()
    room
      .on('disconnected', setRoomState)
      .on('reconnected', setRoomState)
      .on('reconnecting', setRoomState)

    return () => {
      room
        .removeListener('disconnected', setRoomState)
        .removeListener('reconnected', setRoomState)
        .removeListener('reconnecting', setRoomState)
    }
  }, [room])

  return state
}
