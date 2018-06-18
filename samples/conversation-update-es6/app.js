// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { BotFrameworkAdapter } = require('botbuilder');
const restify = require('restify');

const botLogic = require('./bot');

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

// Listen for incoming requests
server.post('/api/messages/', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // On "conversationUpdate"-type activities this bot will send a greeting message to users joining the conversation.
        if (context.activity.type === 'conversationUpdate' && context.activity.membersAdded[0].name !== 'Bot') {
            await context.sendActivity(`Hello "${context.activity.membersAdded[0].name}"!`);
        } else if (context.activity.type === 'message') {
            await context.sendActivity(`Welcome to the conversationUpdate-bot! On a "conversationUpdate"-type activity, this bot will greet new users.`);
        }
    });
});