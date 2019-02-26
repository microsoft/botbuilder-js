"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const botbuilder_1 = require("botbuilder");
const botbuilder_planning_1 = require("botbuilder-planning");
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
// Initialize state storage
const storage = new botbuilder_1.MemoryStorage();
const userState = new botbuilder_1.UserState(storage);
const convoState = new botbuilder_1.ConversationState(storage);
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
const bot = new botbuilder_planning_1.StateMachineDialog('main', 'offHook');
bot.userState = userState.createProperty('user');
bot.botState = convoState.createProperty('bot');
// offHook state
const offHook = bot.addState('offHook', [
    new botbuilder_planning_1.SendActivity(`☎️ off hook`),
    new botbuilder_planning_1.SendActivity(`say "place a call" to get started.`)
]);
offHook.permit('callDialed', 'ringing');
offHook.recognizer = new botbuilder_planning_1.RegExpRecognizer().addIntent('PlaceCallIntent', /place .*call/i);
offHook.addRule(new botbuilder_planning_1.DoStepsRule('PlaceCallIntent', [
    new botbuilder_planning_1.EmitEvent('callDialed')
]));
// ringing state
const ringing = bot.addState('ringing', [
    new botbuilder_planning_1.SendActivity(`☎️ ring... ring...`),
    new botbuilder_planning_1.BoolInput('dialog.answer', `Would you like to answer it?`, true),
    new botbuilder_planning_1.IfProperty(async (state) => state.getValue('dialog.answer'), [
        new botbuilder_planning_1.EmitEvent('callConnected')
    ])
]);
ringing.permit('callConnected', 'connected');
// connected state
const connected = bot.addState('connected', [
    new botbuilder_planning_1.SendActivity(`📞 talk... talk... talk... ☹️`),
    new botbuilder_planning_1.BoolInput('dialog.hangup', `Heard enough yet?`, true),
    new botbuilder_planning_1.IfProperty(async (state) => state.getValue('dialog.hangup'), [
        new botbuilder_planning_1.EmitEvent('callEnded')
    ])
]);
connected.permit('callEnded', 'offHook');
//# sourceMappingURL=index.js.map