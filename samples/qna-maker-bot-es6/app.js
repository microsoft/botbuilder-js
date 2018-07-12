// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { BotFrameworkAdapter } = require('botbuilder');
const { QnAMaker } = require('botbuilder-ai');
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

// Add QnA Maker middleware
// The exported Knowledge Base can be found under `smartLightFAQ.tsv`.
const qnaMaker = new QnAMaker(
    {
        knowledgeBaseId: '',
        endpointKey: '',
        host: ''
    },
    {
        answerBeforeNext: true
    }
);

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, async (context) => {
        // If `!context.responded`, that means an answer wasn't found for the user's utterance.
        // In this case, we send the user info about the bot, as well as an example question to retrieve an answer from QnA Maker.
        let answered = await qnaMaker.answer(context);
        if (!answered) {
            if (context.activity.type === 'message' && !context.responded) {
                await context.sendActivity('No QnA Maker answers were found. This example uses a QnA Maker Knowledge Base that focuses on smart light bulbs. To see QnA Maker in action, ask the bot questions like "Why won\'t it turn on?" or say something like "I need help."');
            } else if (context.activity.type !== 'message') {
                await context.sendActivity(`[${context.activity.type} event detected]`);
            }
        }
    });
});
