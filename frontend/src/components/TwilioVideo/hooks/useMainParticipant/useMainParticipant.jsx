import useVideoContext from '../useVideoContext/useVideoContext';
import useParticipants from '../useParticipants/useParticipants';
import useSelectedParticipant from '../../components/VideoProvider/useSelectedParticipant/useSelectedParticipant';

export default function useMainParticipant() {
  const [selectedParticipant] = useSelectedParticipant();
  const participants = useParticipants();
  const {
    room: { localParticipant },
  } = useVideoContext();

  return selectedParticipant || participants[0] || localParticipant;
}
