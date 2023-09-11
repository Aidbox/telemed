import { act, renderHook } from '@testing-library/react-hooks';
import useLocalTracks from './useLocalTracks';
import Video from 'twilio-video';
import {
  useDevices,
  useHasAudioInputDevices,
  useHasVideoInputDevices,
} from '../../../hooks/deviceHooks/deviceHooks';

jest.mock('../../../hooks/deviceHooks/deviceHooks');
const mockUseHasVideoInputDevices = useHasVideoInputDevices;
const mockUseHasAudioInputDevices = useHasAudioInputDevices;
const mockUseDevices = useDevices;

mockUseHasAudioInputDevices.mockImplementation(() => true);
mockUseHasVideoInputDevices.mockImplementation(() => true);
mockUseDevices.mockImplementation(() => [{ kind: 'videoinput' }, { kind: 'audioinput' }]);

describe('the useLocalTracks hook', () => {
  afterEach(jest.clearAllMocks);

  describe('the getAudioAndVideoTracks function', () => {
    Date.now = () => 123456;

    it('should create local audio and video tracks', async () => {
      const { result } = renderHook(useLocalTracks);

      await act(async () => {
        await result.current.getAudioAndVideoTracks();
      });

      expect(Video.createLocalTracks).toHaveBeenCalledWith({
        audio: true,
        video: {
          frameRate: 24,
          name: 'camera-123456',
        },
      });
    });

    it('should create a local audio track when no video devices are present', async () => {
      mockUseDevices.mockImplementationOnce(() => [{ kind: 'audioinput' }]);

      const { result } = renderHook(useLocalTracks);

      await act(async () => {
        await result.current.getAudioAndVideoTracks();
      });

      expect(Video.createLocalTracks).toHaveBeenCalledWith({
        audio: true,
        video: false,
      });
    });

    it('should create a local video track when no audio devices are present', async () => {
      mockUseDevices.mockImplementationOnce(() => [{ kind: 'videoinput' }]);

      const { result } = renderHook(useLocalTracks);

      await act(async () => {
        await result.current.getAudioAndVideoTracks();
      });

      expect(Video.createLocalTracks).toHaveBeenCalledWith({
        audio: false,
        video: {
          frameRate: 24,
          name: 'camera-123456',
        },
      });
    });

    it('should not create any tracks when no input devices are present', async () => {
      mockUseDevices.mockImplementationOnce(() => []);

      const { result } = renderHook(useLocalTracks);

      await result.current.getAudioAndVideoTracks();

      expect(Video.createLocalTracks).not.toHaveBeenCalled();
    });

    it('should return an error when there is an error creating a track', async () => {
      Video.createLocalTracks.mockImplementationOnce(() =>
        Promise.reject('testError'),
      );
      const { result, waitForNextUpdate } = renderHook(useLocalTracks);

      act(() => {
        expect(result.current.getAudioAndVideoTracks()).rejects.toBe(
          'testError',
        );
      });

      await waitForNextUpdate();
    });
  });

  describe('the removeLocalVideoTrack function', () => {
    it('should call videoTrack.stop() and remove the videoTrack from state', async () => {
      const { result, waitForNextUpdate } = renderHook(useLocalTracks);

      await act(async () => {
        result.current.getAudioAndVideoTracks();
        await waitForNextUpdate();
      });

      const initialVideoTrack = result.current.localTracks.find(
        (track) => track.kind === 'video',
      );
      expect(initialVideoTrack.stop).not.toHaveBeenCalled();
      expect(initialVideoTrack).toBeTruthy();

      act(() => {
        result.current.removeLocalVideoTrack();
      });

      expect(
        result.current.localTracks.some((track) => track.kind === 'video'),
      ).toBe(false);
      expect(initialVideoTrack.stop).toHaveBeenCalled();
    });
  });
});
