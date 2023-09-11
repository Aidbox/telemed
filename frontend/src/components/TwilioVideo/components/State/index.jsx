import React, { createContext, useContext, useState } from 'react'

import { http } from '../../../../service/aidbox'

export const StateContext = createContext(null)

export default function AppStateProvider (props) {
  const [error, setError] = useState(null)
  const [isFetching, setIsFetching] = useState(false)
  const [activeSinkId, setActiveSinkId] = useState('default')

  let contextValue = {
    error,
    setError,
    isFetching,
    activeSinkId,
    setActiveSinkId
  }

  contextValue = {
    ...contextValue,
    getToken: async (identity, roomName) => {
      return http
        .get(`$twilio/get-token/${identity}/${roomName}`)
        .then((res) => res.data.token)
    }
  }

  const getToken = (name, room) => {
    setIsFetching(true)
    return contextValue
      .getToken(name, room)
      .then((res) => {
        setIsFetching(false)
        return res
      })
      .catch((err) => {
        setError(err)
        setIsFetching(false)
        return Promise.reject(err)
      })
  }

  return (
    <StateContext.Provider value={{ ...contextValue, getToken }}>
      {props.children}
    </StateContext.Provider>
  )
}

export function useAppState () {
  const context = useContext(StateContext)
  if (!context) {
    throw new Error('useAppState must be used within the AppStateProvider')
  }
  return context
}
