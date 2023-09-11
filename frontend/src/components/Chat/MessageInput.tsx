import React, { useState } from 'react'

import SendIcon from '../../assets/Send.svg'

import classes from './Chat.module.css'

let shiftPressed = false

export const MessageInput = ({ onSend }: { onSend: (text: string) => void }) => {
  const [value, setValue] = useState('')

  const onDownHandler = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    switch (event.nativeEvent.code) {
      case 'Enter': return onEnterPress(event)
      case 'ShiftRight':
      case 'ShiftLeft': { shiftPressed = true; return true }
    }
  }

  const onUpHandler = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    switch (event.nativeEvent.code) {
      case 'ShiftRight':
      case 'ShiftLeft': { shiftPressed = false; return false }
    }
  }

  const onEnterPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!shiftPressed) {
      event.preventDefault()
      onSend(value)
      setValue('')
    }
  }

  return <div className={classes['message-input']}>
    <textarea
      value={value} placeholder='Write a message...'
      onKeyDown={onDownHandler} onKeyUp={onUpHandler}
      onChange={(e) => setValue(e.target.value)}
    />

    <button
      className={classes.send} disabled={value.trim().length === 0}
      onClick={() => { onSend(value); setValue('') }}
    >
      <SendIcon height={24} width={24} />
    </button>
  </div>
}
