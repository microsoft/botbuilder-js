// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder';
import { AdaptiveDialog, OnUnknownIntent, SendActivity, SetProperty, SwitchCondition, InitProperty, EditArray, ArrayChangeType, TextInput } from 'botbuilder-dialogs-adaptive';
import { DialogManager } from 'botbuilder-dialogs';
import { Case } from 'botbuilder-dialogs-adaptive/lib/actions/case';

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
    new SetProperty('dialog.age', "'22'"),
    new SwitchCondition('dialog.age', null, [
        new Case("21", [
            new SendActivity("age is 21!")
        ]),
        new Case("22", [
            new SendActivity("age is 22!")
        ])
    ])
]));
