import Video from 'twilio-video';
import { useCallback, useState } from 'react';
import { useDevices } from '../../../hooks/deviceHooks/deviceHooks';

export default function useLocalTracks() {
  const [audioTrack, setAudioTrack] = useState();
  const [videoTrack, setVideoTrack] = useState();
  const [isAcquiringLocalTracks, setIsAcquiringLocalTracks] = useState(false);

  const devices = useDevices();

  const hasAudio = (devices || []).filter(device => device.kind === 'audioinput').length > 0;
  const hasVideo = (devices || []).filter(device => device.kind === 'videoinput').length > 0;

  const getLocalAudioTrack = useCallback((deviceId = null) => {
    const options = {};

    if (deviceId) {
      options.deviceId = { exact: deviceId };
    }

    return Video.createLocalAudioTrack(options).then((newTrack) => {
      setAudioTrack(newTrack);
      return newTrack;
    });
  }, []);

  const getLocalVideoTrack = useCallback((newOptions = null) => {
    const options = {
      name: `camera-${Date.now()}`,
      frameRate: 24,
      ...newOptions,
    };

    return Video.createLocalVideoTrack(options).then((newTrack) => {
      setVideoTrack(newTrack);
      return newTrack;
    });
  }, []);

  const removeLocalVideoTrack = useCallback(() => {
    if (videoTrack) {
      videoTrack.stop();
      setVideoTrack(undefined);
    }
  }, [videoTrack]);

  const removeLocalAudioTrack = useCallback(() => {
    if (audioTrack) {
      audioTrack.stop();
      setVideoTrack(undefined);
    }
  }, [audioTrack]);

  const getAudioAndVideoTracks = useCallback(() => {
    if (!hasAudio && !hasVideo) return Promise.resolve();
    if (audioTrack || videoTrack) return Promise.resolve();

    setIsAcquiringLocalTracks(true);
    return Video.createLocalTracks({
      video: hasVideo && {
        frameRate: 24,
        name: `camera-${Date.now()}`,
      },
      audio: hasAudio,
    })
      .then((tracks) => {
        const innerVideoTrack = tracks.find((track) => track.kind === 'video');
        const innerAudioTrack = tracks.find((track) => track.kind === 'audio');

        if (innerVideoTrack) {
          videoTrack && videoTrack.stop();
          setVideoTrack(innerVideoTrack);
        }
        if (innerAudioTrack) {
          audioTrack && audioTrack.stop();
          setAudioTrack(innerAudioTrack);
        }
      })
      .finally(() => setIsAcquiringLocalTracks(false));
  }, [videoTrack, audioTrack, hasAudio, hasVideo]);

  const localTracks = [audioTrack, videoTrack].filter(
    (track) => track !== undefined,
  );

  return {
    localTracks,
    getLocalVideoTrack,
    getLocalAudioTrack,
    isAcquiringLocalTracks,
    removeLocalVideoTrack,
    removeLocalAudioTrack,
    getAudioAndVideoTracks,
  };
}
