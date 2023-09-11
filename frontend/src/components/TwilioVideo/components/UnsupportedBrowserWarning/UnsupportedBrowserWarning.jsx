import React from 'react';
import Video from 'twilio-video';

export default function ({ children }) {
  if (!Video.isSupported) {
    return (
      <div
        style={{
          padding: '1rem',
          backgroundColor: 'white',
          borderRadius: '5px',
          maxWidth: '480px',
        }}
      >
        <div style={{ backgroundColor: 'white', borderRadius: '5px' }}>
          <h3>Browser or context not supported</h3>
          <span>
            Please open this application in one of the{' '}
            <a
              href="https://www.twilio.com/docs/video/javascript#supported-browsers"
              target="_blank"
              rel="noopener"
            >
              supported browsers
            </a>
            .
            <br />
            If you are using a supported browser, please ensure that this app is
            served over a{' '}
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts"
              target="_blank"
              rel="noopener"
            >
              secure context
            </a>
            (e.g. https or localhost).
          </span>
        </div>
      </div>
    );
  }

  return children;
}
