import React from 'react';
import clsx from 'clsx';
import Participant from '../Participant/Participant';
import { makeStyles } from '@material-ui/core/styles';
import useMainParticipant from '../../hooks/useMainParticipant/useMainParticipant';
import useParticipants from '../../hooks/useParticipants/useParticipants';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';

const useStyles = makeStyles({
  container: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '300px',
    height: '300px',
    overflowY: 'auto',
    zIndex: 5,
  },
  transparentBackground: {
    background: 'transparent',
  },
});

export default function ParticipantList() {
  const classes = useStyles();
  const {
    room: { localParticipant },
  } = useVideoContext();
  const participants = useParticipants();
  const [
    selectedParticipant,
    setSelectedParticipant,
  ] = useSelectedParticipant();
  const mainParticipant = useMainParticipant();

  if (participants.length === 0) return null;

  return (
    <aside className={clsx(classes.container)}>
      <div className={classes.scrollContainer}>
        <Participant participant={localParticipant} isLocalParticipant={true} />
        {participants.map((participant) => {
          const isSelected = participant === selectedParticipant;
          const hideParticipant =
            participant === mainParticipant && !isSelected;
          return (
            <Participant
              key={participant.sid}
              participant={participant}
              isSelected={participant === selectedParticipant}
              onClick={() => setSelectedParticipant(participant)}
              hideParticipant={hideParticipant}
            />
          );
        })}
      </div>
    </aside>
  );
}
