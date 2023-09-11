import { useState, useEffect } from 'react'

export default function useMediaStreamTrack (track = null) {
  const [mediaStreamTrack, setMediaStreamTrack] = useState(
    track?.mediaStreamTrack
  )

  useEffect(() => {
    setMediaStreamTrack(track?.mediaStreamTrack)

    if (track) {
      const handleStarted = () => setMediaStreamTrack(track.mediaStreamTrack)
      track.on('started', handleStarted)
      return () => {
        track.removeListener('started', handleStarted)
      }
    }
  }, [track])
  return mediaStreamTrack
}
