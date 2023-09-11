import React from 'react';
import Publication from '../Publication/Publication';
import usePublications from '../../hooks/usePublications/usePublications';

export default function ParticipantTracks({
  participant,
  videoOnly,
  videoPriority,
  isLocalParticipant,
}) {
  const publications = usePublications(participant);

  let filteredPublications;

  filteredPublications = publications.filter(
    (p) => !p.trackName.includes('screen'),
  );

  return (
    <>
      {filteredPublications.map((publication) => (
        <Publication
          key={publication.kind}
          publication={publication}
          participant={participant}
          isLocalParticipant={isLocalParticipant}
          videoOnly={videoOnly}
          videoPriority={videoPriority}
        />
      ))}
    </>
  );
}
