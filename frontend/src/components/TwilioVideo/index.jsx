import React from 'react'

import App from './components/App'
import AppStateProvider from './components/State'
import UnsupportedBrowserWarning from './components/UnsupportedBrowserWarning/UnsupportedBrowserWarning'
import { VideoProvider } from './components/VideoProvider'
import useHeight from './hooks/useHeight/useHeight'

export default function VideoApp (props) {
  const height = useHeight()

  return (
    <div
      style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black'
      }}
    >
      <UnsupportedBrowserWarning>
        <VideoProvider>
          <AppStateProvider>
            <App {...props} />
          </AppStateProvider>
        </VideoProvider>
      </UnsupportedBrowserWarning>
    </div>
  )
}
