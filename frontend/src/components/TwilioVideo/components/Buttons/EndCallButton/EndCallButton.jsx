import React from 'react'

import Button from '../../../../Button'
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext'

export default function EndCallButton (props) {
  const { room } = useVideoContext()

  return (
    <Button
      {...props}
      onClick={() => room.disconnect()}
      variant='danger'
      data-cy-disconnect
    >
      Disconnect
    </Button>
  )
}
