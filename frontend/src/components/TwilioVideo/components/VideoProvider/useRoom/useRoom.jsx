import EventEmitter from 'events'

import { useCallback, useEffect, useRef, useState } from 'react'
import Video from 'twilio-video'

window.TwilioVideo = Video

export default function useRoom (localTracks, onError, options = null) {
  const [room, setRoom] = useState(new EventEmitter())
  const [isConnecting, setIsConnecting] = useState(false)
  const optionsRef = useRef(options)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const connect = useCallback(
    (token) => {
      setIsConnecting(true)
      return Video.connect(token, {
        ...optionsRef.current,
        tracks: localTracks
      }).then(
        (newRoom) => {
          setRoom(newRoom)
          const disconnect = () => newRoom.disconnect()

          newRoom.setMaxListeners(15)

          newRoom.once('disconnected', () => {
            setTimeout(() => setRoom(new EventEmitter()))
            window.removeEventListener('beforeunload', disconnect)
          })

          window.twilioRoom = newRoom

          newRoom.localParticipant.videoTracks.forEach((publication) =>
            publication.setPriority('low')
          )

          setIsConnecting(false)

          window.addEventListener('beforeunload', disconnect)
        },
        (error) => {
          onError(error)
          setIsConnecting(false)
        }
      )
    },
    [localTracks, onError]
  )

  return { room, isConnecting, connect }
}
