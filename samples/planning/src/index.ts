// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { BotFrameworkAdapter, MemoryStorage, UserState, ConversationState } from 'botbuilder';
import { PlanningDialog, FallbackRule, SendActivity, WaitForInput, IfProperty, WelcomeRule, SequenceDialog, RegExpRecognizer, DoStepsRule, CancelDialog, NewPlanRule, CallDialog, RepeatDialog, OnCancelDialogRule  } from 'botbuilder-planning';

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


class TextPrompt extends SequenceDialog {
    constructor(property: string, prompt: string) {
        super(`textPrompt(${property})`, [
            new SendActivity(prompt),
            new WaitForInput('dialog.result')
        ]);

        // Setup output binding
        this.outputBinding = property;

        // Setup recognizer
        const recognizer = new RegExpRecognizer();
        recognizer.addIntent('Cancel', /^cancel/i);
        this.recognizer = recognizer;

        // Listen for user to say cancel
        this.addRule(new DoStepsRule('Cancel', [
            new CancelDialog()
        ]));
    }
}


// Create the main planning dialog and bind to storage.
const dialogs = new PlanningDialog();
dialogs.userState = userState.createProperty('user');
dialogs.botState = convoState.createProperty('bot');

// Setup dialogs recognizer
const recognizer = new RegExpRecognizer();
recognizer.addIntent('PlaceOrder', /place .*order/i);
dialogs.recognizer = recognizer;

// Listen for triggered intents
dialogs.addRule(new NewPlanRule('PlaceOrder', [
    new CallDialog('PlaceOrderDialog')
]));

// Add a top level fallback rule to handle un-recognized utterances
dialogs.addRule(new FallbackRule([
    new SendActivity(`Hi. Ask me to "place an order" to get started.`)
]));

//-----------------------------------------------------------------------------
// Add dialogs
//-----------------------------------------------------------------------------

// PlaceOrderDialog
const placeOrderDialog = new SequenceDialog('PlaceOrderDialog', [
    new CallDialog('AddItemDialog'),
    new TextPrompt('dialog.continue', `Would you like anything else?`),
    new IfProperty(async (state) => state.getValue('dialog.continue') == 'yes', [
        new RepeatDialog()
    ])
]);

placeOrderDialog.addRule(new OnCancelDialogRule([
    new SendActivity(`Item Canceled`)
]));

dialogs.addDialog(placeOrderDialog);

// AddItemDialog
const addItemDialog = new SequenceDialog('AddItemDialog', [
    new TextPrompt('dialog.result.item', `What would you like?`),
    new TextPrompt('dialog.result.quantity', `How many would you like?`),
    new SendActivity(`Ok. I've added {dialog.result.quantity} {dialog.result.item} to your order.`)
]);
dialogs.addDialog(addItemDialog);

/*
//=============================================================================
// Planning Rules
//=============================================================================
// The rules add logic to process the users intent

    new IfProperty(async (state) => state.user.get('name') == undefined, [
        new SendActivity(`Hi, what's your name?`),
        new WaitForInput('user.name'),
    ]),

// Bind planning dialog to its recognizer
const recognizer = new RegExpRecognizer()
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
const addToDoRule = new IntentRule('AddToDo')
    .endPlan()
    .doSteps(
        CallDialog.create('AddToDoDialog')
    );

// Define rules that should only run if we have todos.
// - The ifPropertyRule() lets you define a set of rules that should only run if an expression is true.
// - We're storing the list of todos in "user.todos" which can be manipulated through the passed in state object.
// - In the declarative case the code bellow would be written using our expression syntax. 
const ifHasToDos = new IfPropertyRule(async (state) => {
    const todos: string[] = state.getValue('user.todos');
    return Array.isArray(todos) && todos.length > 0;
});

ifHasToDos.addRule(new IntentRule('DeleteToDo')
    .endPlan()
    .doSteps(
        CallDialog.create('DeleteToDoDialog')
    ));

ifHasToDos.addRule(new IntentRule('ClearToDos')
    .endPlan()
    .doSteps(
        CallDialog.create('ClearToDosDialog')
    ));

ifHasToDos.addRule(new IntentRule('ShowToDos')
    .doSteps(
        CallDialog.create('ShowToDosDialog')
    ));

// Define rules that should run if we don't have todos.
// - These rules just send a message saying there aren't any todos and continue processing
//   of the users current sequence (if there is one.)
const ifNoToDos = new IfPropertyRule(async (state) => {
    const todos: string[] = state.getValue('user.todos');
    return !Array.isArray(todos) || todos.length == 0;
});

ifNoToDos.addRule(new IntentRule('DeleteToDo')
    .doSteps(
        SendActivity.create(`There are no todos to delete.`)
    ));

ifNoToDos.addRule(new IntentRule('ClearToDos')
    .doSteps(
        SendActivity.create(`There are no todos to clear.`)
    ));

ifNoToDos.addRule(new IntentRule('ShowToDos')
    .doSteps(
        SendActivity.create(`You have no todos.`)
    ));

// Add a top level fallback rule to handle un-recognized utterances
const fallbackRule = new FallbackRule()
    .doSteps(
        SendActivity.create(`Hi. To get started ask me to "add a todo named first one"`)
    );

// Add rules to planning dialog in the order they should be evaluated
dialogs.addRule(addToDoRule, ifHasToDos, ifNoToDos, fallbackRule);

//=============================================================================
// Sequences
//=============================================================================
// These are the sequence dialogs that the planning rules call.

// AddToDoDialog
const addToDoDialog = new SequenceDialog('AddToDoDialog')
    .doSteps(
        MapEntity.create('title', 'dialog.result.title'),
        TextPrompt.create('dialog.result.title', `What would you like to call your new todo?`),
        SetProperty.create(async (state) => {
            // Save todo to user state
            const title: string = state.getValue('dialog.result.title');
            const todos: string[] = state.getValue('user.todos') || [];
            todos.push(title);
            state.setValue('user.todos', todos);
        }),
        SendActivity.create(`Added a todo named "{dialog.result.title}". You can delete it by saying "delete todo named {dialog.result.title}".`),
        SendActivity.create(`To view your todos just ask me to "show my todos".`)
    );
dialogs.addDialog(addToDoDialog);

// DeleteToDoDialog
const deleteToDoDialog = new SequenceDialog('DeleteToDoDialog')
    .doSteps(
        MapEntity.create('title', 'dialog.result.title'),
        ChoicePrompt.create('dialog.result.title', `Which todo would you like to remove?`, 'user.todos'),
        SetProperty.create(async (state) => {
            // Remove todo from user state
            const title: string = state.getValue('dialog.result.title.value');
            const todos: string[] = state.getValue('user.todos') || [];
            const pos = todos.indexOf(title);
            if (pos >= 0) {
                todos.splice(pos, 1);
            }
            state.setValue('user.todos', todos);
        }),
        SendActivity.create(`Deleted the todo named "{dialog.result.title.value}". You can delete all your todos by saying "delete all todos".`),
    );
dialogs.addDialog(deleteToDoDialog);

// ClearToDosDialog
const clearToDosDialog = new SequenceDialog('ClearToDosDialog')
    .doSteps(
        SetProperty.create(async (state) => {
            // Clear all todos in user state
            state.setValue('user.todos', []);
        }),
        SendActivity.create(`All todos removed.`)
    );
dialogs.addDialog(clearToDosDialog);

// ShowToDosDialog
const showToDosDialog = new SequenceDialog('ShowToDosDialog')
    .doSteps(
        SendList.create('user.todos', `Here are your todos:`)
    );
dialogs.addDialog(showToDosDialog);
*/