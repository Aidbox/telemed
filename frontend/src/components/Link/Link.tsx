import React from 'react'

import { router } from '../../Router'

interface Props extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
  to: string;
  name?: React.ReactNode
  children: React.ReactNode
}

export const Link = ({ to, children, ...props }: Props) => {
  const click = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault()
    router.push({ path: to, params: {}, query: {}, method: 'push' })
  }

  return (
    <a
      {...props} style={{ cursor: 'pointer' }}
      onClick={(event) => click(event)}
    >{children}</a>
  )
}
