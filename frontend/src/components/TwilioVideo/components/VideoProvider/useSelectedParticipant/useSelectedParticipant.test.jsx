import { act, renderHook } from '@testing-library/react-hooks';
import { EventEmitter } from 'events';
import React from 'react';
import useSelectedParticipant, {
  SelectedParticipantProvider,
} from './useSelectedParticipant';

describe('the useSelectedParticipant hook', () => {
  let mockRoom;
  beforeEach(() => (mockRoom = new EventEmitter()));

  it('should return null as the default value', () => {
    const { result } = renderHook(useSelectedParticipant, {
      wrapper: ({ children }) => (
        <SelectedParticipantProvider room={mockRoom}>
          {children}
        </SelectedParticipantProvider>
      ),
    });
    expect(result.current[0]).toBe(null);
  });

  it('should set a selected participant', () => {
    const { result } = renderHook(useSelectedParticipant, {
      wrapper: ({ children }) => (
        <SelectedParticipantProvider room={mockRoom}>
          {children}
        </SelectedParticipantProvider>
      ),
    });

    act(() => result.current[1]('mockParticipant'));

    expect(result.current[0]).toBe('mockParticipant');
  });

  it('should set "null" as the selected participant when the user selects the currently selected participant', () => {
    const { result } = renderHook(useSelectedParticipant, {
      wrapper: ({ children }) => (
        <SelectedParticipantProvider room={mockRoom}>
          {children}
        </SelectedParticipantProvider>
      ),
    });

    act(() => result.current[1]('mockParticipant'));
    act(() => result.current[1]('mockParticipant'));

    expect(result.current[0]).toBe(null);
  });

  it('should set "null" as the selected participant on room disconnect', () => {
    const { result } = renderHook(useSelectedParticipant, {
      wrapper: ({ children }) => (
        <SelectedParticipantProvider room={mockRoom}>
          {children}
        </SelectedParticipantProvider>
      ),
    });

    act(() => result.current[1]('mockParticipant'));
    expect(result.current[0]).toBe('mockParticipant');
    act(() => {
      mockRoom.emit('disconnected');
    });
    expect(result.current[0]).toBe(null);
  });
});
