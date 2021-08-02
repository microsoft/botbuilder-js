// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const restify = require('restify');
const path = require('path');

const { BotFrameworkAdapter, MemoryStorage, UserState, ConversationState, InspectionState, InspectionMiddleware } = require('botbuilder');
const { MyBot } = require('./bots/myBot')

const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

var memoryStorage = new MemoryStorage();
var inspectionState = new InspectionState(memoryStorage);

var userState = new UserState(memoryStorage);
var conversationState = new ConversationState(memoryStorage);

adapter.use(new InspectionMiddleware(inspectionState, userState, conversationState, { appId: process.env.MicrosoftAppId, appPassword: process.env.MicrosoftAppPassword }));

adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError]: ${ error }`);
    await context.sendActivity(`Oops. Something went wrong!`);
};

var bot = new MyBot(conversationState);

console.log('welcome to test bot - a local test tool for working with the emulator');

let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${ server.name } listening to ${ server.url }`);
});

server.post('/api/mybot', (req, res) => {
    adapter.processActivity(req, res, async (turnContext) => {
        await bot.run(turnContext);
    });
});

server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (turnContext) => {
        await bot.run(turnContext);
    });
});
