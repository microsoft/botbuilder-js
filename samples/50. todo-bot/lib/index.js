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
// Create bot and bind to state storage
const bot = new botbuilder_planning_1.Bot();
bot.storage = new botbuilder_1.MemoryStorage();
// Listen for incoming activities.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route activity to bot.
        await bot.onTurn(context);
    });
});
// Initialize bots root dialog
const dialogs = new botbuilder_planning_1.RuleDialog();
bot.rootDialog = dialogs;
// Add recognizer to root dialog
const recognizer = new botbuilder_planning_1.RegExpRecognizer()
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
dialogs.addRule(new botbuilder_planning_1.WelcomeRule([
    new botbuilder_planning_1.SendActivity(`Hi! I'm a ToDo bot. Say "add a todo named first one" to get started.`)
]));
// Handle recognized intents
dialogs.addRule(new botbuilder_planning_1.NewTopicRule(['#AddToDo'], [
    new botbuilder_planning_1.CallDialog('AddToDoDialog')
]));
dialogs.addRule(new botbuilder_planning_1.NewTopicRule('#DeleteToDo', [
    new botbuilder_planning_1.CallDialog('DeleteToDoDialog')
]));
dialogs.addRule(new botbuilder_planning_1.NewTopicRule('#ClearToDos', [
    new botbuilder_planning_1.CallDialog('ClearToDosDialog')
]));
dialogs.addRule(new botbuilder_planning_1.AddTopicRule('#ShowToDos', [
    new botbuilder_planning_1.CallDialog('ShowToDosDialog')
]));
// Define rules to handle cancel events
dialogs.addRule(new botbuilder_planning_1.EventRule('cancelAdd', [
    new botbuilder_planning_1.SendActivity(`Ok... Cancelled adding new alarm.`)
]));
dialogs.addRule(new botbuilder_planning_1.EventRule('cancelDelete', [
    new botbuilder_planning_1.SendActivity(`Ok...`)
]));
// Define rules for handling errors
dialogs.addRule(new botbuilder_planning_1.EventRule('error', [
    new botbuilder_planning_1.SendActivity(`Oops. An error occurred: {message}`)
]));
// Define rule for default response
dialogs.addRule(new botbuilder_planning_1.DefaultResponseRule([
    new botbuilder_planning_1.SendActivity(`Say "add a todo named first one" to get started.`)
]));
//=============================================================================
// Sequences
//=============================================================================
const cancelRecognizer = new botbuilder_planning_1.RegExpRecognizer().addIntent('CancelIntent', /^cancel/i);
// AddToDoDialog
const addToDoDialog = new botbuilder_planning_1.SequenceDialog('AddToDoDialog', [
    new botbuilder_planning_1.SaveEntity('$title', '@title'),
    new botbuilder_planning_1.SendActivity(`What would you like to call your new todo?`),
    new botbuilder_planning_1.WaitForInput('dialog.result.title'),
    new botbuilder_planning_1.ChangeList(botbuilder_planning_1.ChangeListType.push, '$user.todos', '$title'),
    new botbuilder_planning_1.SendActivity(`Added a todo named "{$title}". You can delete it by saying "delete todo named {$title}".`),
    new botbuilder_planning_1.SendActivity(`To view your todos just ask me to "show my todos".`)
]);
addToDoDialog.recognizer = cancelRecognizer;
addToDoDialog.addRule(new botbuilder_planning_1.DigressionRule('CancelIntent', [
    new botbuilder_planning_1.CancelDialog('cancelAdd')
]));
dialogs.addDialog(addToDoDialog);
// DeleteToDoDialog
const deleteToDoDialog = new botbuilder_planning_1.SequenceDialog('DeleteToDoDialog', [
    new botbuilder_planning_1.IfProperty('$user.todos', [
        new botbuilder_planning_1.SaveEntity('$title', '@title'),
        new botbuilder_planning_1.ChoiceInput('$title', `Which todo would you like to remove?`, '$user.todos'),
        new botbuilder_planning_1.ChangeList(botbuilder_planning_1.ChangeListType.remove, '$user.todos', '$title'),
        new botbuilder_planning_1.SendActivity(`Deleted the todo named "{$title}". You can delete all your todos by saying "delete all todos".`),
    ]).else([
        new botbuilder_planning_1.SendActivity(`No todos to delete.`)
    ])
]);
deleteToDoDialog.recognizer = cancelRecognizer;
deleteToDoDialog.addRule(new botbuilder_planning_1.DigressionRule('CancelIntent', [
    new botbuilder_planning_1.CancelDialog('cancelDelete')
]));
dialogs.addDialog(deleteToDoDialog);
// ClearToDosDialog
const clearToDosDialog = new botbuilder_planning_1.SequenceDialog('ClearToDosDialog', [
    new botbuilder_planning_1.IfProperty('$user.todos', [
        new botbuilder_planning_1.ChangeList(botbuilder_planning_1.ChangeListType.clear, '$user.todos'),
        new botbuilder_planning_1.SendActivity(`All todos removed.`)
    ]).else([
        new botbuilder_planning_1.SendActivity(`No todos to clear.`)
    ])
]);
dialogs.addDialog(clearToDosDialog);
// ShowToDosDialog
const showToDosDialog = new botbuilder_planning_1.SequenceDialog('ShowToDosDialog', [
    new botbuilder_planning_1.IfProperty('$user.todos', [
        new botbuilder_planning_1.SendList('$user.todos', `Here are your todos:`)
    ]).else([
        new botbuilder_planning_1.SendActivity(`You have no todos.`)
    ])
]);
dialogs.addDialog(showToDosDialog);
//# sourceMappingURL=index.js.map