import React from 'react';
import ReactWebChat from 'botframework-webchat';

function App({directLine}) {
  // nonce related to botbuilder-js content security issue #2762:
  // https://github.com/microsoft/botbuilder-js/issues/2762
  return (
    <ReactWebChat directLine={directLine} nonce="a1b2c3d" />
  );
}

export default App;
