import React, { useCallback, useRef } from 'react'

import Button from '../../../../Button'
import { useHasVideoInputDevices } from '../../../hooks/deviceHooks/deviceHooks'
import useLocalVideoToggle from '../../../hooks/useLocalVideoToggle/useLocalVideoToggle'
import VideoOffIcon from '../../../icons/VideoOffIcon'
import VideoOnIcon from '../../../icons/VideoOnIcon'

export default function ToggleVideoButton (props) {
  const [isVideoEnabled, toggleVideoEnabled] = useLocalVideoToggle()
  const lastClickTimeRef = useRef(0)
  const hasVideoDevices = useHasVideoInputDevices()

  const toggleVideo = useCallback(() => {
    if (Date.now() - lastClickTimeRef.current > 200) {
      lastClickTimeRef.current = Date.now()
      toggleVideoEnabled()
    }
  }, [toggleVideoEnabled])

  return (
    <Button
      size='sm'
      onClick={toggleVideo}
      disabled={!hasVideoDevices || props.disabled}
      icon={isVideoEnabled ? <VideoOnIcon /> : <VideoOffIcon />}
    >
      {!hasVideoDevices ? 'No Video' : null}
      {isVideoEnabled ? 'Stop Video' : 'Start Video'}
    </Button>
  )
}
