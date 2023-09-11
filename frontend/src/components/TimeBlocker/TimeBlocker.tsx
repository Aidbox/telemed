import addSeconds from 'date-fns/addSeconds'
import React, { useEffect, useState } from 'react'

interface Props {
  children: React.ReactNode,
  lastUpdated: string
}

export default function TimeBlocker ({ children, lastUpdated }: Props) {
  const [requiredTime, updateRequiredTime] = useState(addSeconds(new Date(lastUpdated), 15))
  const [currentTime, updateCurrentTime] = useState(new Date())

  useEffect(() => {
    updateRequiredTime(addSeconds(new Date(lastUpdated), 15))
  }, [lastUpdated])

  useEffect(() => {
    const id = setInterval(() => updateCurrentTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [lastUpdated])

  if (lastUpdated && currentTime <= requiredTime) {
    return (
      <span>
        You will be able to resend confirmation message in:&nbsp;
        <span>0:{('0' + Math.floor((requiredTime.getTime() - currentTime.getTime()) / 1000)).slice(-2)}</span>
      </span>
    )
  }

  return children
}
