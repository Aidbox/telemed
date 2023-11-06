import { useEffect, useState } from 'react'

export default function useTrack (publication) {
  const [track, setTrack] = useState(publication && publication.track)

  useEffect(() => {
    setTrack(publication && publication.track)

    if (publication) {
      const removeTrack = () => setTrack(null)

      publication.on('subscribed', setTrack)
      publication.on('unsubscribed', removeTrack)
      return () => {
        publication.removeListener('subscribed', setTrack)
        publication.removeListener('unsubscribed', removeTrack)
      }
    }
  }, [publication])

  return track
}
