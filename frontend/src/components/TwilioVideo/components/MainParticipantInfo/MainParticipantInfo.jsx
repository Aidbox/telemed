import React from 'react';
import AvatarIcon from '../../icons/AvatarIcon';

import useIsTrackSwitchedOff from '../../hooks/useIsTrackSwitchedOff/useIsTrackSwitchedOff';
import usePublications from '../../hooks/usePublications/usePublications';
import useTrack from '../../hooks/useTrack/useTrack';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useParticipantIsReconnecting from '../../hooks/useParticipantIsReconnecting/useParticipantIsReconnecting';
import AudioLevelIndicator from '../AudioLevelIndicator/AudioLevelIndicator';
import classes from './MainParticipantInfo.module.css';

export default function MainParticipantInfo({ participant, children }) {
  const {
    room: { localParticipant },
  } = useVideoContext();
  const isLocal = localParticipant === participant;

  const publications = usePublications(participant);
  const videoPublication = publications.find((p) =>
    p.kind.includes('video'),
  );

  const videoTrack = useTrack(videoPublication);
  const isVideoEnabled = Boolean(videoTrack);

  const audioPublication = publications.find((p) => p.kind === 'audio');
  const audioTrack = useTrack(audioPublication);

  const isVideoSwitchedOff = useIsTrackSwitchedOff(videoTrack);
  const isParticipantReconnecting = useParticipantIsReconnecting(participant);

  return (
    <div
      data-cy-main-participant
      data-cy-participant={participant.identity}
      className={classes.container}
    >
      <div className={classes.infoContainer}>
        <div className={classes.identity}>
          <AudioLevelIndicator audioTrack={audioTrack} />
          <span>
            {participant.identity.split(':')[1].replace('%20', ' ')}
            {isLocal && ' (You)'}
          </span>
        </div>
      </div>
      {(!isVideoEnabled || isVideoSwitchedOff) && (
        <div className={classes.avatarContainer}>
          <AvatarIcon />
        </div>
      )}
      {isParticipantReconnecting && (
        <div className={classes.reconnectingContainer}>
          <span style={{ color: 'white' }}>Reconnecting...</span>
        </div>
      )}
      {children}
    </div>
  );
}
