import clsx from 'clsx'
import React from 'react'

import classes from './TextArea.module.css'

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement>{
  resize?: boolean
}

export function TextArea ({ resize = false, className, ...rest }: Props) {
  const styles = clsx({
    [classes['text-area']]: true,
    [classes['text-area__noresize']]: !resize
  }, className)

  return <textarea className={styles} { ...rest } />
}
