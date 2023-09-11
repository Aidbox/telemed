import React from 'react';
import useTrack from '../../hooks/useTrack/useTrack';
import AudioTrack from '../AudioTrack/AudioTrack';
import VideoTrack from '../VideoTrack/VideoTrack';

export default function Publication({
  publication,
  isLocalParticipant,
  videoOnly,
  videoPriority,
}) {
  const track = useTrack(publication);

  if (!track) return null;

  switch (track.kind) {
    case 'video':
      return (
        <VideoTrack
          track={track}
          priority={videoPriority}
          isLocal={track.name.includes('camera') && isLocalParticipant}
        />
      );
    case 'audio':
      return videoOnly ? null : <AudioTrack track={track} />;
    default:
      return null;
  }
}
