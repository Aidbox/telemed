import React from 'react'

import { router } from '../../Router'

interface Props extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
  to: string
  name?: React.ReactNode
  children: React.ReactNode
}

export const Link = ({ to, children, onClick, className, ...props }: Props) => {
  const click = async (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault()
    onClick && onClick(event)
    await router.push({ path: to, params: {}, query: {}, method: 'push' })
  }

  return (
    <a
      {...props} style={{ cursor: 'pointer' }}
      className={className || ''}
      onClick={(event) => click(event)}
    >{children}</a>
  )
}
