// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { BotFrameworkAdapter, BotStateSet, ConversationState, MemoryStorage, UserState } = require('botbuilder');
const restify = require('restify');

const createBotLogic = require('./bot');

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

const botLogic = createBotLogic(convoState);

// Listen for incoming requests
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, botLogic);
});