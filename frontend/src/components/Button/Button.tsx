import clsx from 'clsx'
import React from 'react'

import classes from './Button.module.css'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement>{
  size?: string,
  variant: 'primary' | 'secondary' | 'danger' | 'info',
  className?: string,
  icon?: React.ReactNode,
  full?: boolean
  children: React.ReactNode
}

export default function Button ({ icon, size = 'lg', variant, className, full, children, ...rest }: Props) {
  const styles = clsx({
    [classes.btn]: true,
    [classes['btn-' + size]]: true,
    [classes[variant]]: variant,
    [classes.btnBlock]: Boolean(full)
  }, className)

  return (
    <button className={styles} { ...rest }>
      {icon || null} {children}
    </button>
  )
}
