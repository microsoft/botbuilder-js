// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } from 'botbuilder';
import { AdaptiveDialog, OnUnknownIntent, SendActivity, TextInput, SetProperty } from 'botbuilder-dialogs-adaptive';
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
bot.conversationState = new ConversationState(new MemoryStorage());
bot.userState = new UserState(new MemoryStorage());

// Listen for incoming activities.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route activity to bot.
        await bot.onTurn(context);
    });
});

// Initialize bots root dialog
const dialogs = new AdaptiveDialog();
bot.rootDialog = dialogs;

// Handle unknown intents
dialogs.addRule(new OnUnknownIntent([
    new SetProperty('dialog.username', 'null'),
    new TextInput('dialog.username', `Hi! what's your name?`),
    new SendActivity(`Hi {dialog.username}. It's nice to meet you.`)
]));
