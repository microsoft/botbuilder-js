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
// Initialize state storage
const storage = new botbuilder_1.MemoryStorage();
const userState = new botbuilder_1.UserState(storage);
const convoState = new botbuilder_1.ConversationState(storage);
// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await bot.run(context);
        // Save state changes
        await userState.saveChanges(context);
        await convoState.saveChanges(context);
    });
});
// Create the bots main dialog and bind it to storage.
const bot = new botbuilder_planning_1.PlanningDialog();
bot.userState = userState.createProperty('user');
bot.botState = convoState.createProperty('bot');
//=============================================================================
// Planning Rules
//=============================================================================
// The rules add logic to process the users intent
// Bind planning dialog to its recognizer
const recognizer = new botbuilder_planning_1.RegExpRecognizer()
    .addIntent('AddToDo', /(?:add|create) .*(?:to-do|todo|task) .*(?:called|named) (?<title>.*)/i)
    .addIntent('AddToDo', /(?:add|create) .*(?:to-do|todo|task)/i)
    .addIntent('DeleteToDo', /(?:delete|remove|clear) .*(?:to-do|todo|task) .*(?:called|named) (?<title>.*)/i)
    .addIntent('DeleteToDo', /(?:delete|remove|clear) .*(?:to-do|todo|task)/i)
    .addIntent('ClearToDos', /(?:delete|remove|clear) (?:all|every) (?:to-dos|todos|tasks)/i)
    .addIntent('ShowToDos', /(?:show|see|view) .*(?:to-do|todo|task)/i);
bot.recognizer = recognizer;
// Define welcome rule
bot.addRule(new botbuilder_planning_1.WelcomeRule([
    new botbuilder_planning_1.SendActivity(`Hi! I'm a ToDo bot. Say "add a todo named first one" to get started.`)
]));
// Define rules to handle various intents
// - These all just start a dialog
bot.addRule(new botbuilder_planning_1.ReplacePlanRule('AddToDo', [
    new botbuilder_planning_1.CallDialog('AddToDoDialog')
]));
bot.addRule(new botbuilder_planning_1.ReplacePlanRule('DeleteToDo', [
    new botbuilder_planning_1.CallDialog('DeleteToDoDialog')
]));
bot.addRule(new botbuilder_planning_1.ReplacePlanRule('ClearToDos', [
    new botbuilder_planning_1.CallDialog('ClearToDosDialog')
]));
bot.addRule(new botbuilder_planning_1.DoStepsRule('ShowToDos', [
    new botbuilder_planning_1.CallDialog('ShowToDosDialog')
]));
// Define rules to handle cancel events
bot.addRule(new botbuilder_planning_1.EventRule('cancelAdd', [
    new botbuilder_planning_1.SendActivity(`Ok... Cancelled adding new alarm.`)
]));
bot.addRule(new botbuilder_planning_1.EventRule('cancelDelete', [
    new botbuilder_planning_1.SendActivity(`Ok...`)
]));
// Define rules for handling errors
bot.addRule(new botbuilder_planning_1.EventRule('error', [
    new botbuilder_planning_1.SendActivity(`Oops. An error occurred: {message}`)
]));
// Define FallbackRule
bot.addRule(new botbuilder_planning_1.FallbackRule([
    new botbuilder_planning_1.SendActivity(`Say "add a todo named first one" to get started.`)
]));
//=============================================================================
// Sequences
//=============================================================================
// These are the sequence dialogs that the planning rules call.
const cancelRecognizer = new botbuilder_planning_1.RegExpRecognizer().addIntent('CancelIntent', /^cancel/i);
// AddToDoDialog
const addToDoDialog = new botbuilder_planning_1.SequenceDialog('AddToDoDialog', [
    new botbuilder_planning_1.SaveEntity('title', 'dialog.result.title'),
    new botbuilder_planning_1.TextInput('dialog.result.title', `What would you like to call your new todo?`),
    new botbuilder_planning_1.CodeStep(async (planning) => {
        // Save todo to user state
        const title = planning.state.getValue('dialog.result.title');
        const todos = planning.state.getValue('user.todos') || [];
        todos.push(title);
        planning.state.setValue('user.todos', todos);
        return await planning.endDialog();
    }),
    new botbuilder_planning_1.SendActivity(`Added a todo named "{dialog.result.title}". You can delete it by saying "delete todo named {dialog.result.title}".`),
    new botbuilder_planning_1.SendActivity(`To view your todos just ask me to "show my todos".`)
]);
addToDoDialog.recognizer = cancelRecognizer;
addToDoDialog.addRule(new botbuilder_planning_1.DoStepsRule('CancelIntent', [
    new botbuilder_planning_1.CancelDialog('cancelAdd')
]));
bot.addDialog(addToDoDialog);
// DeleteToDoDialog
const deleteToDoDialog = new botbuilder_planning_1.SequenceDialog('DeleteToDoDialog', [
    new botbuilder_planning_1.IfProperty('user.todos', [
        new botbuilder_planning_1.SaveEntity('title', 'dialog.result.title'),
        new botbuilder_planning_1.ChoiceInput('dialog.result.title', `Which todo would you like to remove?`, 'user.todos'),
        new botbuilder_planning_1.CodeStep(async (planning) => {
            // Remove todo from user state
            const title = planning.state.getValue('dialog.result.title');
            const todos = planning.state.getValue('user.todos') || [];
            const pos = todos.indexOf(title);
            if (pos >= 0) {
                todos.splice(pos, 1);
            }
            planning.state.setValue('user.todos', todos);
            return await planning.endDialog();
        }),
        new botbuilder_planning_1.SendActivity(`Deleted the todo named "{dialog.result.title}". You can delete all your todos by saying "delete all todos".`),
    ]).else([
        new botbuilder_planning_1.SendActivity(`No todos to delete.`)
    ])
]);
deleteToDoDialog.recognizer = cancelRecognizer;
deleteToDoDialog.addRule(new botbuilder_planning_1.DoStepsRule('CancelIntent', [
    new botbuilder_planning_1.CancelDialog('cancelDelete')
]));
bot.addDialog(deleteToDoDialog);
// ClearToDosDialog
const clearToDosDialog = new botbuilder_planning_1.SequenceDialog('ClearToDosDialog', [
    new botbuilder_planning_1.IfProperty('user.todos', [
        new botbuilder_planning_1.CodeStep(async (planning) => {
            // Clear all todos in user state
            planning.state.setValue('user.todos', []);
            return await planning.endDialog();
        }),
        new botbuilder_planning_1.SendActivity(`All todos removed.`)
    ]).else([
        new botbuilder_planning_1.SendActivity(`No todos to clear.`)
    ])
]);
bot.addDialog(clearToDosDialog);
// ShowToDosDialog
const showToDosDialog = new botbuilder_planning_1.SequenceDialog('ShowToDosDialog', [
    new botbuilder_planning_1.IfProperty('user.todos', [
        new botbuilder_planning_1.SendList('user.todos', `Here are your todos:`)
    ]).else([
        new botbuilder_planning_1.SendActivity(`You have no todos.`)
    ])
]);
bot.addDialog(showToDosDialog);
//# sourceMappingURL=index.js.map