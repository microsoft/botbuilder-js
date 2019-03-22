// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { BotFrameworkAdapter, MemoryStorage } from 'botbuilder';
import { Bot, AdaptiveDialog, DefaultRule, SendActivity, IfProperty, WelcomeRule, RegExpRecognizer, CallDialog, CancelDialog, EventRule, SendList, SaveEntity, ChoiceInput, ChangeList, ChangeListType, IntentRule, TextInput, PlanChangeType, BeginDialogRule, EndDialog } from 'botbuilder-rules';

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

// Initialize bots root dialog
const dialogs = new AdaptiveDialog();
bot.rootDialog = dialogs;

// Add recognizer to root dialog
const recognizer = new RegExpRecognizer()
    .addIntent('AddToDo', /(?:add|create) .*(?:to-do|todo|task) .*(?:called|named) (?<title>.*)/i)
    .addIntent('AddToDo', /(?:add|create) .*(?:to-do|todo|task)/i)
    .addIntent('DeleteToDo', /(?:delete|remove|clear) .*(?:to-do|todo|task) .*(?:called|named) (?<title>.*)/i)
    .addIntent('DeleteToDo', /(?:delete|remove|clear) .*(?:to-do|todo|task)/i)
    .addIntent('ClearToDos', /(?:delete|remove|clear) (?:all|every) (?:to-dos|todos|tasks)/i)
    .addIntent('ShowToDos', /(?:show|see|view) .*(?:to-do|todo|task)/i);
dialogs.recognizer = recognizer;

//=============================================================================
// Rules
//=============================================================================

// Define welcome rule
dialogs.addRule(new WelcomeRule([
    new SendActivity(`Hi! I'm a ToDo bot. Say "add a todo named first one" to get started.`)
]));

// Handle recognized intents
dialogs.addRule(new IntentRule('#AddToDo', [
    new CallDialog('AddToDoDialog')
]));

dialogs.addRule(new IntentRule('#DeleteToDo', [
    new CallDialog('DeleteToDoDialog')
]));

dialogs.addRule(new IntentRule('#ClearToDos', [
    new CallDialog('ClearToDosDialog')
]))

dialogs.addRule(new IntentRule('#ShowToDos', [
    new CallDialog('ShowToDosDialog')
], PlanChangeType.doSteps));

// Define rules to handle cancel events
dialogs.addRule(new EventRule('cancelAdd', [
    new SendActivity(`Ok... Cancelled adding new alarm.`)
]));

dialogs.addRule(new EventRule('cancelDelete', [
    new SendActivity(`Ok...`)
]));

// Define rules for handling errors
dialogs.addRule(new EventRule('error', [
    new SendActivity(`Oops. An error occurred: {message}`)
]));

// Define rule for default response
dialogs.addRule(new DefaultRule([
    new SendActivity(`Say "add a todo named first one" to get started.`)
]));

//=============================================================================
// Sequences
//=============================================================================

const cancelRecognizer = new RegExpRecognizer().addIntent('CancelIntent', /^cancel/i);

// AddToDoDialog
const addToDoDialog = new AdaptiveDialog('AddToDoDialog');
addToDoDialog.recognizer = cancelRecognizer;

addToDoDialog.addRule(new IntentRule('#CancelIntent', [
    new CancelDialog('cancelAdd')
]));

addToDoDialog.addRule(new BeginDialogRule([
    new SaveEntity('$title', '@title'),
    new TextInput('$title', `What would you like to call your new todo?`),
    new ChangeList(ChangeListType.push, 'user.todos', '$title'),
    new SendActivity(`Added a todo named "{$title}". You can delete it by saying "delete todo named {$title}".`),
    new SendActivity(`To view your todos just ask me to "show my todos".`),
    new EndDialog()
]));
dialogs.addDialog(addToDoDialog);

// DeleteToDoDialog
const deleteToDoDialog = new AdaptiveDialog('DeleteToDoDialog');
deleteToDoDialog.recognizer = cancelRecognizer;

deleteToDoDialog.addRule(new IntentRule('#CancelIntent', [
    new CancelDialog('cancelDelete')
], PlanChangeType.doSteps));

deleteToDoDialog.addRule(new BeginDialogRule([
    new IfProperty('user.todos', [
        new SaveEntity('$title', '@title'),
        new ChoiceInput('$title', `Which todo would you like to remove?`, 'user.todos'),
        new ChangeList(ChangeListType.remove, '$user.todos', '$title'),
        new SendActivity(`Deleted the todo named "{$title}". You can delete all your todos by saying "delete all todos".`),
    ]).else([
        new SendActivity(`No todos to delete.`)
    ]),
    new EndDialog()
]));
dialogs.addDialog(deleteToDoDialog);

// ClearToDosDialog
const clearToDosDialog = new AdaptiveDialog('ClearToDosDialog');
clearToDosDialog.addRule(new BeginDialogRule([
    new IfProperty('user.todos', [
        new ChangeList(ChangeListType.clear, 'user.todos'),
        new SendActivity(`All todos removed.`)
    ]).else([
        new SendActivity(`No todos to clear.`)
    ]),
    new EndDialog()
]));
dialogs.addDialog(clearToDosDialog);

// ShowToDosDialog
const showToDosDialog = new AdaptiveDialog('ShowToDosDialog');
showToDosDialog.addRule(new BeginDialogRule([
    new IfProperty('user.todos', [
        new SendList('user.todos', `Here are your todos:`)
    ]).else([
        new SendActivity(`You have no todos.`)
    ]),
    new EndDialog()
]));
dialogs.addDialog(showToDosDialog);
