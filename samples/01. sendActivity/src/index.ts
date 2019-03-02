// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { BotFrameworkAdapter, MemoryStorage, UserState, ConversationState } from 'botbuilder';
import { PlanningDialog, FallbackRule, SendActivity, SequenceDialog, CallDialog, RepeatDialog, WaitForInput, IfProperty, CodeStep, EndDialog, BoolInput, TextInput, DoStepsLater, SetPlanTitle, RegExpRecognizer, DoStepsRule, CancelDialog, EventRule, OnCatch } from 'botbuilder-planning';

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

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await bot.onTurn(context);
    });
});

// Create the main planning dialog and bind to storage.
const bot = new PlanningDialog();
bot.storage = new MemoryStorage();

// Add a top level fallback rule to handle received messages
bot.addRule(new FallbackRule([
    new CallDialog('hello')
]));

bot.addRule(new EventRule('cancelDialog', [
    new SendActivity('ok canceling')
]))

bot.addRule(new EventRule('cancelApi', [
    new SendActivity('api call cancelled')
]))

const helloDialog = new SequenceDialog('hello', [
    new CallDialog('myApi'),
    new IfProperty('!conversation.apiSuccess', [
        new DoStepsLater([
            new SendActivity(`I'm really done`)
        ])
    ]),
    new SetPlanTitle(`booking your trip to {dialog.result.dest}`),
    new IfProperty('conversation.maxAlarms', [
        new SendActivity('max alarms'),
        new EndDialog()
    ]),
    new TextInput('conversation.alarmTime', `What time would you like to set your alarm for?`),
    new SendActivity(`done`)
]);
bot.addDialog(helloDialog);

const callApi = new SequenceDialog('myApi', [
    new SendActivity(`calling api...`),
    new CodeStep(async (planning) => {
        planning.state.setValue('conversation.apiSuccess', false);
        planning.state.setValue('conversation.maxAlarms', false);
        planning.state.setValue('conversation.alarmTime', '9am');
        return await planning.endDialog();
    }),
    new WaitForInput()
]);
callApi.recognizer = new RegExpRecognizer().addIntent('Cancel', /^cancel/i);
callApi.addRule(new DoStepsRule('Cancel', [
    new CancelDialog('cancelApi')
]));
bot.addDialog(callApi);