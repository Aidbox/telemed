import MainParticipantInfo from '../MainParticipantInfo/MainParticipantInfo';
import ParticipantTracks from '../ParticipantTracks/ParticipantTracks';
import React from 'react';
import useMainParticipant from '../../hooks/useMainParticipant/useMainParticipant';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

export default function MainParticipant() {
  const mainParticipant = useMainParticipant();
  const {
    room: { localParticipant },
  } = useVideoContext();
  const [selectedParticipant] = useSelectedParticipant();

  const videoPriority =
    mainParticipant === selectedParticipant &&
    mainParticipant !== localParticipant
      ? 'high'
      : null;

  return (
    <MainParticipantInfo participant={mainParticipant}>
      <ParticipantTracks
        participant={mainParticipant}
        videoOnly
        videoPriority={videoPriority}
        isLocalParticipant={mainParticipant === localParticipant}
      />
    </MainParticipantInfo>
  );
}
