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
const bot = new botbuilder_planning_1.PlanningDialog();
bot.userState = userState.createProperty('user');
bot.botState = convoState.createProperty('bot');
// Add a top level fallback rule to handle received messages
bot.addRule(new botbuilder_planning_1.FallbackRule([
    new botbuilder_planning_1.SendActivity(`Hi! what's your name?`),
    new botbuilder_planning_1.WaitForInput('user.name'),
    new botbuilder_planning_1.SendActivity(`Hi {user.name}. It's nice to meet you.`)
]));
//# sourceMappingURL=index.js.map