import React, { useCallback, useEffect, useState } from 'react'

import Button from '../../../../Button'
import { useVideoInputDevices } from '../../../hooks/deviceHooks/deviceHooks'
import useMediaStreamTrack from '../../../hooks/useMediaStreamTrack/useMediaStreamTrack'
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext'

import FlipCameraIcon from './FlipCameraIcon'

export default function FlipCameraButton () {
  const { localTracks } = useVideoContext()
  const [supportsFacingMode, setSupportsFacingMode] = useState(null)
  const videoTrack = localTracks.find((track) => track.name.includes('camera'))
  const mediaStreamTrack = useMediaStreamTrack(videoTrack)
  const videoDeviceList = useVideoInputDevices()

  useEffect(() => {
    const currentFacingMode = mediaStreamTrack?.getSettings().facingMode
    if (currentFacingMode && supportsFacingMode === null) {
      setSupportsFacingMode(true)
    }
  }, [mediaStreamTrack, supportsFacingMode])

  const toggleFacingMode = useCallback(() => {
    const newFacingMode =
      mediaStreamTrack?.getSettings().facingMode === 'user'
        ? 'environment'
        : 'user'
    videoTrack.restart({
      facingMode: newFacingMode
    })
  }, [mediaStreamTrack, videoTrack])

  return supportsFacingMode && videoDeviceList.length > 1
? (
  <Button
    onClick={toggleFacingMode}
    disabled={!videoTrack}
    icon={<FlipCameraIcon />}
  >
    Flip Camera
  </Button>
  )
: null
}
