// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { BotFrameworkAdapter, MemoryStorage, UserState, ConversationState } from 'botbuilder';
import { PlanningDialog, FallbackRule, SendActivity, StateMachineDialog, RegExpRecognizer, DoStepsRule, EmitEvent, BoolInput, IfProperty, SetProperty } from 'botbuilder-planning';

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open echobot.bot file in the Emulator.`);
});

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
const adapter = new BotFrameworkAdapter({
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword,
});

// Initialize state storage
const storage = new MemoryStorage();
const userState = new UserState(storage);
const convoState = new ConversationState(storage);

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await bot.run(context);

        // Save state changes
        await userState.saveChanges(context);
        await convoState.saveChanges(context);
    });
});

// Create the main planning dialog and bind to storage.
const bot = new StateMachineDialog('main', 'offHook');
bot.userState = userState.createProperty('user');
bot.botState = convoState.createProperty('bot');

// offHook state
const offHook = bot.addState('offHook', [
    new SendActivity(`☎️ off hook`),
    new SendActivity(`say "place a call" to get started.`)
]);
offHook.permit('callDialed', 'ringing');
offHook.recognizer = new RegExpRecognizer().addIntent('PlaceCallIntent', /place .*call/i);
offHook.addRule(new DoStepsRule('PlaceCallIntent', [
    new EmitEvent('callDialed')
]));


// ringing state
const ringing = bot.addState('ringing', [
    new SendActivity(`☎️ ring... ring...`),
    new BoolInput('dialog.answer', `Would you like to answer it?`, true),
    new IfProperty(async (state) => state.getValue('dialog.answer'), [
        new EmitEvent('callConnected')
    ])
]);
ringing.permit('callConnected', 'connected');


// connected state
const connected = bot.addState('connected', [
    new SendActivity(`📞 talk... talk... talk... ☹️`),
    new BoolInput('dialog.hangup', `Heard enough yet?`, true),
    new IfProperty(async (state) => state.getValue('dialog.hangup'), [
        new EmitEvent('callEnded')
    ])
]);
connected.permit('callEnded', 'offHook');
