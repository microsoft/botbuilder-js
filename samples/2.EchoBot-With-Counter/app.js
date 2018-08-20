// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { BotFrameworkAdapter, MemoryStorage, ConversationState } = require('botbuilder');
const restify = require('restify');
const EchoBot = require('./MainDialog/echo-bot');

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`\n${server.name} listening to ${server.url}`);
    // TODO: update to aka.ms link for emulator download
    console.log(`\nGet emulator: https://github.com/Microsoft/BotFramework-Emulator/releases/tag/v4.0.15-alpha`)
    console.log(`\nTo talk to your bot, open the EchoBot-With-Counter.bot file in the Emulator`);
});

// Create adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Add state middleware
const convoState = new ConversationState(new MemoryStorage());
//adapter.use(new BotStateSet(convoState, userState));
adapter.use(convoState);

//const echoBot = new EchoBot(convoState);
let turnCounter = convoState.createProperty('count');
// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, async (context) => {
        if (context.activity.type === 'message') {
            let count = await turnCounter.get(context);
            count = count === undefined ? 0 : count;
            await context.sendActivity(`${count}: You said "${context.activity.text}"`);
            turnCounter.set(context, ++count);
        }
        else {
            await context.sendActivity(`[${context.activity.type} event detected]`);
        }
    });
});

