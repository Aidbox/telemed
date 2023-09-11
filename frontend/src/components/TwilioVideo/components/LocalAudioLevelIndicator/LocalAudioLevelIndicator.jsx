import React from 'react';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import AudioLevelIndicator from '../AudioLevelIndicator/AudioLevelIndicator';

export default function LocalAudioLevelIndicator() {
  const { localTracks } = useVideoContext();
  const audioTrack = localTracks.find((track) => track.kind === 'audio');

  return <AudioLevelIndicator audioTrack={audioTrack} />;
}
