"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const botbuilder_1 = require("botbuilder");
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
// Initialize state storage
const storage = new botbuilder_1.MemoryStorage();
const userState = new botbuilder_1.UserState(storage);
const convoState = new botbuilder_1.ConversationState(storage);
// Create the main planning dialog and bind to storage.
const dialogs = new botbuilder_dialogs_1.PlanningDialog();
dialogs.userState = userState.createProperty('user');
dialogs.botState = convoState.createProperty('bot');
// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await dialogs.run(context);
        // Save state changes
        await userState.saveChanges(context);
        await convoState.saveChanges(context);
    });
});
const recognizer = new botbuilder_dialogs_1.RegExpRecognizer()
    .addIntent('Help', /^help/i)
    .addIntent('Cancel', /^cancel/i);
// Planning rules
dialogs
    .setRecognizer(recognizer)
    .addRule(new botbuilder_dialogs_1.IntentRule('Help').doNow(botbuilder_dialogs_1.CallDialog.create('HelpDialog')))
    .addRule(new botbuilder_dialogs_1.FallbackRule().doNow(botbuilder_dialogs_1.CallDialog.create('SurveyDialog'), botbuilder_dialogs_1.SendActivity.create(`Thanks {dialog.lastResult.name}. I enjoy programming in {dialog.lastResult.language.value} too.`)));
// Survey Dialog
dialogs.addDialog(new botbuilder_dialogs_1.SequenceDialog('SurveyDialog')
    .setRecognizer(recognizer)
    .addRule(new botbuilder_dialogs_1.IntentRule('Cancel').doNow(botbuilder_dialogs_1.CancelAllDialogs.create()))
    .do(botbuilder_dialogs_1.SendActivity.create(`Please take this short survey. You can say "cancel" at anytime.`), botbuilder_dialogs_1.TextPrompt.create('dialog.result.name', `What is your name?`), botbuilder_dialogs_1.NumberPrompt.create('dialog.result.age', `Hi {dialog.result.name}. How old are you?`), botbuilder_dialogs_1.ChoicePrompt.create('dialog.result.language', `What is your preferred programming language?`, ['c#', 'TypeScript', 'JavaScript'])));
// Help dialog
dialogs.addDialog(new botbuilder_dialogs_1.SequenceDialog('HelpDialog')
    .do(botbuilder_dialogs_1.SendActivity.create(`I'm an echo bot. Say something to me and I'll say it back.`)));
//# sourceMappingURL=index.js.map