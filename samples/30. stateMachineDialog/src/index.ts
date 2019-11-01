// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { BotFrameworkAdapter, MemoryStorage } from 'botbuilder';
import { SendActivity, StateMachineDialog, RegExpRecognizer, EmitEvent, ConfirmInput, IfCondition, OnIntent } from 'botbuilder-dialogs-adaptive';
import { DialogManager } from 'botbuilder-dialogs';

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


// Create bots DialogManager and bind to state storage
const bot = new DialogManager();
bot.storage = new MemoryStorage();

// Listen for incoming activities.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route activity to bot.
        await bot.onTurn(context);
    });
});

// Initialize bots root dialog
const dialogs = new StateMachineDialog('main', 'offHook');
bot.rootDialog = dialogs;

// offHook state
const offHook = dialogs.addState('offHook', [
    new SendActivity(`☎️ off hook`),
    new SendActivity(`say "place a call" to get started.`)
]);
offHook.permit('callDialed', 'ringing');
offHook.recognizer = new RegExpRecognizer().addIntent('PlaceCallIntent', /place .*call/i);
offHook.addRule(new OnIntent('PlaceCallIntent', [
    new EmitEvent('callDialed')
]));


// ringing state
const ringing = dialogs.addState('ringing', [
    new SendActivity(`☎️ ring... ring...`),
    new ConfirmInput('$answer', `Would you like to answer it?`, true),
    new IfCondition('$answer == true', [
        new EmitEvent('callConnected')
    ])
]);
ringing.permit('callConnected', 'connected');


// connected state
const connected = dialogs.addState('connected', [
    new SendActivity(`📞 talk... talk... talk... ☹️`),
    new ConfirmInput('$hangup', `Heard enough yet?`, true),
    new IfCondition('$hangup == true', [
        new EmitEvent('callEnded')
    ])
]);
connected.permit('callEnded', 'offHook');
