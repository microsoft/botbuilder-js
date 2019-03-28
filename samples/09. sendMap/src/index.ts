// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { BotFrameworkAdapter, MemoryStorage } from 'botbuilder';
import { Bot, AdaptiveDialog, DefaultRule, SetProperty, SendMap, MapType } from 'botbuilder-dialogs-adaptive';

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

// Create bot and bind to state storage
const bot = new Bot();
bot.storage = new MemoryStorage();

// Listen for incoming activities.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route activity to bot.
        await bot.onTurn(context);
    });
});

const bingMapsKey = 'AlUaNNIoQRik0DZRUj518gEoFeVSxRjo5MTv6JDU1GPX_djqyMFRwIBv89nlfJM6';

// Initialize bots root dialog
const dialogs = new AdaptiveDialog();
bot.rootDialog = dialogs;

// Add a default rule for handling incoming messages
dialogs.addRule(new DefaultRule([
    new SetProperty(`conversation.mapPins = ["47.6221,-122.3540;46;1", "47.6205,-122.3493;46;2"]`),
    new SendMap(bingMapsKey, MapType.aerialWithLabels, 'conversation.mapPins')
]));
