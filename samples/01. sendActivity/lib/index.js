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
// Setup bot with storage provider used to persist the bots state.
const bot = new botbuilder_planning_1.Bot();
bot.storage = new botbuilder_1.MemoryStorage();
// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route activities to bot.
        await bot.onTurn(context);
    });
});
// Create the bots root dialog.
const rules = new botbuilder_planning_1.RuleDialog();
bot.rootDialog = rules;
// Add a default rule for handling incoming messages
rules.addRule(new botbuilder_planning_1.FallbackRule([
    new botbuilder_planning_1.CallDialog('hello')
]));
//# sourceMappingURL=index.js.map