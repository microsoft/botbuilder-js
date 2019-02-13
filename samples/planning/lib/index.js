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
dialogs.recognizer = new botbuilder_dialogs_1.RegExpRecognizer()
    .addIntent('Help', /^help/i);
// Add rules
dialogs.addRule(new botbuilder_dialogs_1.IntentRule('Help').doNow(botbuilder_dialogs_1.SendActivity.create({ activityOrText: `I'm an echo bot. Say something to me and I'll say it back.` })));
dialogs.addRule(new botbuilder_dialogs_1.FallbackRule().doNow(botbuilder_dialogs_1.SetState.create((state) => {
    const count = state.conversation.get('count') || 0;
    state.conversation.set('count', count + 1);
}), botbuilder_dialogs_1.SendActivity.create({ activityOrText: `{conversation.count}: you said "{utterance}".` })));
//# sourceMappingURL=index.js.map