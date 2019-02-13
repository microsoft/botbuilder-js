// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { BotFrameworkAdapter, MemoryStorage, UserState, ConversationState } from 'botbuilder';
import { PlanningDialog, FallbackRule, SendActivity, SetState, RegExpRecognizer, IntentRule, SequenceDialog, CallDialog, CancelAllDialogs, TextPrompt, NumberPrompt, ChoicePrompt } from 'botbuilder-dialogs';

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

// Initialize state storage
const storage = new MemoryStorage();
const userState = new UserState(storage);
const convoState = new ConversationState(storage);

// Create the main planning dialog and bind to storage.
const dialogs = new PlanningDialog();
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

const recognizer = new RegExpRecognizer()
    .addIntent('Help', /^help/i)
    .addIntent('Cancel', /^cancel/i);

// Planning rules
dialogs
    .setRecognizer(recognizer)
    .addRule(new IntentRule('Help').doNow(
        CallDialog.create('HelpDialog'),
    ))
    .addRule(new FallbackRule().doNow(
        CallDialog.create('SurveyDialog'),
        SendActivity.create(`Thanks {dialog.lastResult.name}. I enjoy programming in {dialog.lastResult.language.value} too.`)
    ));

// Survey Dialog
dialogs.addDialog(new SequenceDialog('SurveyDialog')
    .setRecognizer(recognizer)
    .addRule(new IntentRule('Cancel').doNow(
        CancelAllDialogs.create()
    ))
    .do(
        SendActivity.create(`Please take this short survey. You can say "cancel" at anytime.`),
        TextPrompt.create('dialog.result.name', `What is your name?`),
        NumberPrompt.create('dialog.result.age', `Hi {dialog.result.name}. How old are you?`),
        ChoicePrompt.create('dialog.result.language', `What is your preferred programming language?`, ['c#', 'TypeScript', 'JavaScript']),
    ));

// Help dialog
dialogs.addDialog(new SequenceDialog('HelpDialog')
    .do(
        SendActivity.create(`I'm an echo bot. Say something to me and I'll say it back.`)
    ));
