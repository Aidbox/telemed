import React from 'react';
import styled from 'styled-components';
import MainParticipant from '../MainParticipant/MainParticipant';
import ParticipantList from '../ParticipantList/ParticipantList';

const Container = styled('div')({
  position: 'relative',
  height: '100%',
});

export default function Room() {
  return (
    <Container>
      <MainParticipant />
      <ParticipantList />
    </Container>
  );
}
