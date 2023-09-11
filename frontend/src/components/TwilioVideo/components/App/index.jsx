import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

import useRoomState from '../../hooks/useRoomState/useRoomState'
import useVideoContext from '../../hooks/useVideoContext/useVideoContext'
import MenuBar from '../MenuBar/MenuBar'
import PreJoinScreen from '../PreJoinScreen'
import Room from '../Room/Room'

const Container = styled('div')({
  display: 'flex',
  height: '100%',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center'
})

const Main = styled('main')({
  overflow: 'hidden',
  height: '100%',
  width: '100%',
  paddingBottom: '72px',
  background: 'black',
  flexGrow: 0,
  position: 'relative'
})

export default function App (props) {
  const beforeUnmount = useRef(false)
  const roomState = useRoomState()
  const { removeLocalVideoTrack, removeLocalAudioTrack } = useVideoContext()

  useEffect(() => () => { beforeUnmount.current = true }, [])

  useEffect(() => () => {
    if (beforeUnmount.current) {
      removeLocalVideoTrack()
      removeLocalAudioTrack()
    }
  }, [removeLocalAudioTrack, removeLocalVideoTrack])

  return (
    <Container>
      {roomState === 'disconnected'
        ? (<PreJoinScreen {...props} />)
        : (<Main><Room /><MenuBar /></Main>)}
    </Container>
  )
}
