// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { BotFrameworkAdapter, MemoryStorage } from 'botbuilder';
import { PlanningDialog, FallbackRule, CallDialog, RepeatDialog, WaitForInput, IfProperty, CodeStep, EndDialog, BoolInput, TextInput, DoStepsLater, SetPlanTitle, RegExpRecognizer, DoStepsRule, CancelDialog, EventRule, OnCatch, Bot, RuleDialog } from 'botbuilder-planning';

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

// Setup bot with storage provider used to persist the bots state.
const bot = new Bot();
bot.storage = new MemoryStorage();

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route activities to bot.
        await bot.onTurn(context);
    });
});

// Create the bots root dialog.
const rules = new RuleDialog();
bot.rootDialog = rules;

// Add a default rule for handling incoming messages
rules.addRule(new FallbackRule([
    new CallDialog('hello')
]));
