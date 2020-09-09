import React from 'react';
import ReactWebChat from 'botframework-webchat';

function App({directLine}) {
  return (
    <ReactWebChat directLine={directLine} nonce="a1b2c3d" />
  );
}

export default App;
