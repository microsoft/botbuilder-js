// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { BotFrameworkAdapter, MemoryStorage } from 'botbuilder';
import { Bot, RuleDialog, DefaultResponseRule, SendActivity, IfProperty, WelcomeRule, TextInput, RegExpRecognizer, SequenceDialog, CallDialog, CancelDialog, EventRule, SendList, SaveEntity, ChoiceInput, ChangeList, ChangeListType, NewTopicRule, DigressionRule, CodeStep, AddTopicRule, WaitForInput } from 'botbuilder-planning';

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
const dialogs = new RuleDialog();
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
dialogs.addRule(new NewTopicRule(['#AddToDo'], [
    new CallDialog('AddToDoDialog')
]));

dialogs.addRule(new NewTopicRule('#DeleteToDo', [
    new CallDialog('DeleteToDoDialog')
]));

dialogs.addRule(new NewTopicRule('#ClearToDos', [
    new CallDialog('ClearToDosDialog')
]))

dialogs.addRule(new AddTopicRule('#ShowToDos', [
    new CallDialog('ShowToDosDialog')
]));

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
dialogs.addRule(new DefaultResponseRule([
    new SendActivity(`Say "add a todo named first one" to get started.`)
]));

//=============================================================================
// Sequences
//=============================================================================

const cancelRecognizer = new RegExpRecognizer().addIntent('CancelIntent', /^cancel/i);

// AddToDoDialog
const addToDoDialog = new SequenceDialog('AddToDoDialog', [
    new SaveEntity('$title', '@title'),
    new SendActivity(`What would you like to call your new todo?`),
    new WaitForInput('dialog.result.title'),
    new ChangeList(ChangeListType.push, '$user.todos', '$title'),
    new SendActivity(`Added a todo named "{$title}". You can delete it by saying "delete todo named {$title}".`),
    new SendActivity(`To view your todos just ask me to "show my todos".`)
]);
addToDoDialog.recognizer = cancelRecognizer;
addToDoDialog.addRule(new DigressionRule('CancelIntent', [
    new CancelDialog('cancelAdd')
]))
dialogs.addDialog(addToDoDialog);

// DeleteToDoDialog
const deleteToDoDialog = new SequenceDialog('DeleteToDoDialog', [
    new IfProperty('$user.todos', [
        new SaveEntity('$title', '@title'),
        new ChoiceInput('$title', `Which todo would you like to remove?`, '$user.todos'),
        new ChangeList(ChangeListType.remove, '$user.todos', '$title'),
        new SendActivity(`Deleted the todo named "{$title}". You can delete all your todos by saying "delete all todos".`),
    ]).else([
        new SendActivity(`No todos to delete.`)
    ])
]);
deleteToDoDialog.recognizer = cancelRecognizer;
deleteToDoDialog.addRule(new DigressionRule('CancelIntent', [
    new CancelDialog('cancelDelete')
]))
dialogs.addDialog(deleteToDoDialog);

// ClearToDosDialog
const clearToDosDialog = new SequenceDialog('ClearToDosDialog', [
    new IfProperty('$user.todos', [
        new ChangeList(ChangeListType.clear, '$user.todos'),
        new SendActivity(`All todos removed.`)
    ]).else([
        new SendActivity(`No todos to clear.`)
    ])
]);
dialogs.addDialog(clearToDosDialog);

// ShowToDosDialog
const showToDosDialog = new SequenceDialog('ShowToDosDialog', [
    new IfProperty('$user.todos', [
        new SendList('$user.todos', `Here are your todos:`)
    ]).else([
        new SendActivity(`You have no todos.`)
    ])
]);
dialogs.addDialog(showToDosDialog);
