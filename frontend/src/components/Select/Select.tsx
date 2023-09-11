import clsx from 'clsx'
import React from 'react'

import css from './Select.module.css'

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement>{}

export default function Select ({ children, className, ...rest }: Props) {
  const styles = clsx({ [css.slct]: true }, 'form-control', className)

  return (
    <select className={styles} {...rest}>
      {children}
    </select>
  )
}
