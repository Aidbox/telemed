import { useState, useEffect } from 'react'

export default function useIsTrackSwitchedOff (track) {
  const [isSwitchedOff, setIsSwitchedOff] = useState(
    track && track.isSwitchedOff
  )

  useEffect(() => {
    setIsSwitchedOff(track && track.isSwitchedOff)

    if (track) {
      const handleSwitchedOff = () => setIsSwitchedOff(true)
      const handleSwitchedOn = () => setIsSwitchedOff(false)
      track.on('switchedOff', handleSwitchedOff)
      track.on('switchedOn', handleSwitchedOn)
      return () => {
        track.removeListener('switchedOff', handleSwitchedOff)
        track.removeListener('switchedOn', handleSwitchedOn)
      }
    }
  }, [track])

  return !!isSwitchedOff
}
