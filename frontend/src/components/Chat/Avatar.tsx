import React from 'react'

import classes from './Chat.module.css'

export const Avatar = ({ photo }: { photo:string }) => {
  return <div className={classes.avatar}><img src={photo} alt='' />
  </div>
}
