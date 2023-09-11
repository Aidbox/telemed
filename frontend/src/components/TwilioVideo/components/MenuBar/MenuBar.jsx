import React from 'react';

import EndCallButton from '../Buttons/EndCallButton/EndCallButton';
import FlipCameraButton from './FlipCameraButton/FlipCameraButton';

import useRoomState from '../../hooks/useRoomState/useRoomState';
import { Grid, Hidden } from '@material-ui/core';
import ToggleAudioButton from '../Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleVideoButton from '../Buttons/ToggleVideoButton/ToggleVideoButton';
import classes from './MenuBar.module.css';

export default function MenuBar() {
  const roomState = useRoomState();
  const isReconnecting = roomState === 'reconnecting';

  return (
    <>
      <div className={classes.container}>
        <Grid container justify="space-around" alignItems="center">
          <Grid style={{ flex: 1 }} />
          <Grid item>
            <Grid container justify="center">
              <ToggleAudioButton disabled={isReconnecting} />
              <ToggleVideoButton disabled={isReconnecting} />
              <FlipCameraButton />
            </Grid>
          </Grid>
          <Hidden smDown>
            <Grid style={{ flex: 1 }}>
              <Grid container justify="flex-end">
                <EndCallButton />
              </Grid>
            </Grid>
          </Hidden>
        </Grid>
      </div>
    </>
  );
}
