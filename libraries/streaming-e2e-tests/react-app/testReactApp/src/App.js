import React from 'react';
import ReactWebChat from 'botframework-webchat';

function App({directLine}) {
  return (
    <ReactWebChat directLine={directLine} />
  );
}

export default App;