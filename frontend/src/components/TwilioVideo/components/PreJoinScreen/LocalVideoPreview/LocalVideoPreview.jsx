import React from 'react';
import AvatarIcon from '../../../icons/AvatarIcon';
import VideoTrack from '../../VideoTrack/VideoTrack';
import LocalAudioLevelIndicator from '../../LocalAudioLevelIndicator/LocalAudioLevelIndicator';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import classes from './LocalVideoPreview.module.css';

export default function LocalVideoPreview({ identity }) {
  const { localTracks } = useVideoContext();

  const videoTrack = localTracks.find((track) => track.name.includes('camera'));
  return (
    <div className={classes.container}>
      <div className={classes.innerContainer}>
        {videoTrack ? (
          <VideoTrack track={videoTrack} isLocal />
        ) : (
          <div className={classes.avatarContainer}>
            <AvatarIcon />
          </div>
        )}
      </div>

      <div className={classes.identityContainer}>
        <span className={classes.identity}>
          <LocalAudioLevelIndicator />
          <span>{identity}</span>
        </span>
      </div>
    </div>
  );
}
