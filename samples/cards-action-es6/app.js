// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { BotFrameworkAdapter, MessageFactory } = require('botbuilder');
const { ActionTypes } = require("botbuilder-core");

const restify = require('restify');

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
            await context.sendActivity(`Welcome to the CardActions-bot!`);
            await context.sendActivity(getSuggestedActions());
        }

        if (context.activity.type === 'message') {
            if (isBackAction(context)) {
                await context.sendActivity(`You sent "_${context.activity.text}_"`);
            }

            await context.sendActivity(getSuggestedActions());
        }
    });
});


function getSuggestedActions() {
    var suggestedActions = [
        {
            type: ActionTypes.ImBack,
            title: 'ImBack',
            value: 'message to bot from ImBack action'
        },
        {
            type: ActionTypes.PostBack,
            title: 'PostBack',
            value: 'hidden message from PostBack action'
        },
        {
            type: ActionTypes.OpenUrl,
            title: 'OpenUrl',
            value: 'https://dev.botframework.com/'
        }
    ];

    return MessageFactory.suggestedActions(suggestedActions, 'Select and action to perform');
}

function isBackAction(context) {
    var message = context.activity.text;
    return message === 'message to bot from ImBack action'
        || message === 'hidden message from PostBack action';
}