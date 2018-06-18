// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { BotStateSet, BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } = require('botbuilder');
const restify = require('restify');
const createEchoBot = require('./echoBot');

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Add state middleware
const storage = new MemoryStorage();
const convoState = new ConversationState(storage);
const userState = new UserState(storage);
adapter.use(new BotStateSet(convoState, userState));

const echoBot = createEchoBot(convoState);

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, echoBot);
});
