import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import useMediaStreamTrack from '../../hooks/useMediaStreamTrack/useMediaStreamTrack';

const Video = styled('video')({
  width: '100%',
  height: '100%',
});

export default function VideoTrack({ track, isLocal, priority }) {
  const ref = useRef(null);
  const mediaStreamTrack = useMediaStreamTrack(track);

  useEffect(() => {
    const el = ref.current;
    el.muted = true;
    if (track.setPriority && priority) {
      track.setPriority(priority);
    }
    track.attach(el);
    return () => {
      track.detach(el);
      if (track.setPriority && priority) {
        track.setPriority(null);
      }
    };
  }, [track, priority]);

  const isFrontFacing =
    mediaStreamTrack?.getSettings().facingMode !== 'environment';
  const style = {
    transform: isLocal && isFrontFacing ? 'rotateY(180deg)' : '',
    objectFit: 'cover',
  };

  return <Video ref={ref} style={style} />;
}
