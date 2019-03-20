An example of how to use the BotDebugger to debug a bot with the Emulator.

## Running the Bot

 1. CD into the repository root and run `npm install && lerna bootstrap --hoist && npm run build`
 2. Add `EMULATOR_URL=http://localhost:9000`, `PORT=3979` and `NODE_ENV=development` to your environment variables.
 3. cd into this (sample root) directory and run `npm run build && npm start`
 4. Open the Emulator