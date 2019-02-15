"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
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
// Initialize state storage
const storage = new botbuilder_1.MemoryStorage();
const userState = new botbuilder_1.UserState(storage);
const convoState = new botbuilder_1.ConversationState(storage);
// Create the main planning dialog and bind to storage.
const dialogs = new botbuilder_dialogs_1.PlanningDialog();
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
//=============================================================================
// Planning Rules
//=============================================================================
// The rules add logic to process the users intent
// Bind planning dialog to its recognizer
const recognizer = new botbuilder_dialogs_1.RegExpRecognizer()
    .addIntent('AddToDo', /(?:add|create) .*(?:to-do|todo|task) .*(?:called|named) (?<title>.*)/i)
    .addIntent('AddToDo', /(?:add|create) .*(?:to-do|todo|task)/i)
    .addIntent('DeleteToDo', /(?:delete|remove|clear) .*(?:to-do|todo|task) .*(?:called|named) (?<title>.*)/i)
    .addIntent('DeleteToDo', /(?:delete|remove|clear) .*(?:to-do|todo|task)/i)
    .addIntent('ClearToDos', /(?:delete|remove|clear) (?:all|every) (?:to-dos|todos|tasks)/i)
    .addIntent('ShowToDos', /(?:show|see|view) .*(?:to-do|todo|task)/i);
dialogs.recognizer = recognizer;
// Define rule to handle AddToDo intent.
// - This rule simply starts a sequence that processes the intent.
// - Any recognized entities will be automatically passed as options to the started sequence.
// - The .endPlan() clause cases the rule to interrupt any sequence that might be currently running.
const addToDoRule = new botbuilder_dialogs_1.IntentRule('AddToDo')
    .endPlan()
    .doSteps(botbuilder_dialogs_1.CallDialog.create('AddToDoDialog'));
// Define rules that should only run if we have todos.
// - The ifPropertyRule() lets you define a set of rules that should only run if an expression is true.
// - We're storing the list of todos in "user.todos" which can be manipulated through the passed in state object.
// - In the declarative case the code bellow would be written using our expression syntax. 
const ifHasToDos = new botbuilder_dialogs_1.IfPropertyRule(async (state) => {
    const todos = state.getValue('user.todos');
    return Array.isArray(todos) && todos.length > 0;
});
ifHasToDos.addRule(new botbuilder_dialogs_1.IntentRule('DeleteToDo')
    .endPlan()
    .doSteps(botbuilder_dialogs_1.CallDialog.create('DeleteToDoDialog')));
ifHasToDos.addRule(new botbuilder_dialogs_1.IntentRule('ClearToDos')
    .endPlan()
    .doSteps(botbuilder_dialogs_1.CallDialog.create('ClearToDosDialog')));
ifHasToDos.addRule(new botbuilder_dialogs_1.IntentRule('ShowToDos')
    .doSteps(botbuilder_dialogs_1.CallDialog.create('ShowToDosDialog')));
// Define rules that should run if we don't have todos.
// - These rules just send a message saying there aren't any todos and continue processing
//   of the users current sequence (if there is one.)
const ifNoToDos = new botbuilder_dialogs_1.IfPropertyRule(async (state) => {
    const todos = state.getValue('user.todos');
    return !Array.isArray(todos) || todos.length == 0;
});
ifNoToDos.addRule(new botbuilder_dialogs_1.IntentRule('DeleteToDo')
    .doSteps(botbuilder_dialogs_1.SendActivity.create(`There are no todos to delete.`)));
ifNoToDos.addRule(new botbuilder_dialogs_1.IntentRule('ClearToDos')
    .doSteps(botbuilder_dialogs_1.SendActivity.create(`There are no todos to clear.`)));
ifNoToDos.addRule(new botbuilder_dialogs_1.IntentRule('ShowToDos')
    .doSteps(botbuilder_dialogs_1.SendActivity.create(`You have no todos.`)));
// Add a top level fallback rule to handle un-recognized utterances
const fallbackRule = new botbuilder_dialogs_1.FallbackRule()
    .doSteps(botbuilder_dialogs_1.SendActivity.create(`Hi. To get started ask me to "add a todo named first one"`));
// Add rules to planning dialog in the order they should be evaluated
dialogs.addRule(addToDoRule, ifHasToDos, ifNoToDos, fallbackRule);
//=============================================================================
// Sequences
//=============================================================================
// These are the sequence dialogs that the planning rules call.
// AddToDoDialog
const addToDoDialog = new botbuilder_dialogs_1.SequenceDialog('AddToDoDialog')
    .doSteps(botbuilder_dialogs_1.MapEntity.create('title', 'dialog.result.title'), botbuilder_dialogs_1.TextPrompt.create('dialog.result.title', `What would you like to call your new todo?`), botbuilder_dialogs_1.SetProperty.create(async (state) => {
    // Save todo to user state
    const title = state.getValue('dialog.result.title');
    const todos = state.getValue('user.todos') || [];
    todos.push(title);
    state.setValue('user.todos', todos);
}), botbuilder_dialogs_1.SendActivity.create(`Added a todo named "{dialog.result.title}". You can delete it by saying "delete todo named {dialog.result.title}".`), botbuilder_dialogs_1.SendActivity.create(`To view your todos just ask me to "show my todos".`));
dialogs.addDialog(addToDoDialog);
// DeleteToDoDialog
const deleteToDoDialog = new botbuilder_dialogs_1.SequenceDialog('DeleteToDoDialog')
    .doSteps(botbuilder_dialogs_1.MapEntity.create('title', 'dialog.result.title'), botbuilder_dialogs_1.ChoicePrompt.create('dialog.result.title', `Which todo would you like to remove?`, 'user.todos'), botbuilder_dialogs_1.SetProperty.create(async (state) => {
    // Remove todo from user state
    const title = state.getValue('dialog.result.title.value');
    const todos = state.getValue('user.todos') || [];
    const pos = todos.indexOf(title);
    if (pos >= 0) {
        todos.splice(pos, 1);
    }
    state.setValue('user.todos', todos);
}), botbuilder_dialogs_1.SendActivity.create(`Deleted the todo named "{dialog.result.title.value}". You can delete all your todos by saying "delete all todos".`));
dialogs.addDialog(deleteToDoDialog);
// ClearToDosDialog
const clearToDosDialog = new botbuilder_dialogs_1.SequenceDialog('ClearToDosDialog')
    .doSteps(botbuilder_dialogs_1.SetProperty.create(async (state) => {
    // Clear all todos in user state
    state.setValue('user.todos', []);
}), botbuilder_dialogs_1.SendActivity.create(`All todos removed.`));
dialogs.addDialog(clearToDosDialog);
// ShowToDosDialog
const showToDosDialog = new botbuilder_dialogs_1.SequenceDialog('ShowToDosDialog')
    .doSteps(botbuilder_dialogs_1.SendList.create('user.todos', `Here are your todos:`));
dialogs.addDialog(showToDosDialog);
//# sourceMappingURL=index.js.map