// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { BotFrameworkAdapter, MemoryStorage } from 'botbuilder';
import { Bot, AdaptiveDialog, DefaultRule, SendActivity, TextInput, IfProperty, WelcomeRule, RegExpRecognizer, IntentRule, WaitForInput, CallDialog, BeginDialogRule, EndDialog } from 'botbuilder-rules';

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
const adapter = new BotFrameworkAdapter({
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword,
});

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open echobot.bot file in the Emulator.`);
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

// Initialize bots root dialog
const dialogs = new AdaptiveDialog();
bot.rootDialog = dialogs;

//=================================================================================================
// Top Level Rules
//=================================================================================================

// Greet the user
dialogs.addRule(new WelcomeRule([
    new SendActivity(`I'm a joke bot. To get started say "tell me a joke".`)
]));

// Add a top level fallback rule to handle received messages
dialogs.addRule(new DefaultRule([
    new CallDialog('AskNameDialog')
]));

// Tell the user a joke
dialogs.recognizer = new RegExpRecognizer().addIntent('JokeIntent', /tell .*joke/i);
dialogs.addRule(new IntentRule('#JokeIntent', [
    new CallDialog('TellJokeDialog')
]));

//=================================================================================================
// Support Dialogs
//=================================================================================================

const askNameDialog = new AdaptiveDialog('AskNameDialog');
askNameDialog.addRule(new BeginDialogRule([
    new IfProperty('!user.name', [
        new TextInput('user.name', `Hi! what's your name?`)
    ]),
    new SendActivity(`Hi {user.name}. It's nice to meet you.`),
    new EndDialog()
]));
dialogs.addDialog(askNameDialog)

const tellJokeDialog = new AdaptiveDialog('TellJokeDialog');
tellJokeDialog.addRule(new BeginDialogRule([
    new SendActivity(`Why did the 🐔 cross the 🛣️?`),
    new WaitForInput(),
    new SendActivity(`To get to the other side...`),
    new EndDialog()
]));
dialogs.addDialog(tellJokeDialog);