import { useEffect, useState } from 'react'

export default function useHeight (reservedHeight = null) {
  const getParentHeight = () => {
    const parentNode = document.querySelector('[class^=_master]')
    return (parentNode ? parentNode.clientHeight : window.innerHeight) - 88
  }

  const [height, setHeight] = useState()

  useEffect(() => {
    const onResize = () => {
      setHeight(getParentHeight() * (window.visualViewport?.scale || 1))
    }

    onResize()

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  })

  return reservedHeight ? height - reservedHeight + 'px' : height + 'px'
}
