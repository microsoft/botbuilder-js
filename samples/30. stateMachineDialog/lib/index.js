"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open echobot.bot file in the Emulator.`);
});
// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword,
});
// Create bots DialogManager and bind to state storage
const bot = new botbuilder_dialogs_1.DialogManager();
bot.storage = new botbuilder_1.MemoryStorage();
// Listen for incoming activities.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route activity to bot.
        await bot.onTurn(context);
    });
});
// Initialize bots root dialog
const dialogs = new botbuilder_dialogs_adaptive_1.StateMachineDialog('main', 'offHook');
bot.rootDialog = dialogs;
// offHook state
const offHook = dialogs.addState('offHook', [
    new botbuilder_dialogs_adaptive_1.SendActivity(`☎️ off hook`),
    new botbuilder_dialogs_adaptive_1.SendActivity(`say "place a call" to get started.`)
]);
offHook.permit('callDialed', 'ringing');
offHook.recognizer = new botbuilder_dialogs_adaptive_1.RegExpRecognizer().addIntent('PlaceCallIntent', /place .*call/i);
offHook.addRule(new botbuilder_dialogs_adaptive_1.OnIntent('PlaceCallIntent', [
    new botbuilder_dialogs_adaptive_1.EmitEvent('callDialed')
]));
// ringing state
const ringing = dialogs.addState('ringing', [
    new botbuilder_dialogs_adaptive_1.SendActivity(`☎️ ring... ring...`),
    new botbuilder_dialogs_adaptive_1.ConfirmInput('$answer', `Would you like to answer it?`, true),
    new botbuilder_dialogs_adaptive_1.IfCondition('$answer == true', [
        new botbuilder_dialogs_adaptive_1.EmitEvent('callConnected')
    ])
]);
ringing.permit('callConnected', 'connected');
// connected state
const connected = dialogs.addState('connected', [
    new botbuilder_dialogs_adaptive_1.SendActivity(`📞 talk... talk... talk... ☹️`),
    new botbuilder_dialogs_adaptive_1.ConfirmInput('$hangup', `Heard enough yet?`, true),
    new botbuilder_dialogs_adaptive_1.IfCondition('$hangup == true', [
        new botbuilder_dialogs_adaptive_1.EmitEvent('callEnded')
    ])
]);
connected.permit('callEnded', 'offHook');
//# sourceMappingURL=index.js.map