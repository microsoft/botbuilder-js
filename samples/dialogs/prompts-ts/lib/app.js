"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const botbuilder_services_1 = require("botbuilder-services");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const restify = require("restify");
// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});
// Create adapter and listen to servers '/api/messages' route.
const adapter = new botbuilder_services_1.BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', adapter.listen());
const dialogs = new botbuilder_dialogs_1.DialogSet();
// Initialize bot by passing it adapter and middleware
const bot = new botbuilder_1.Bot(adapter)
    .use(new botbuilder_1.MemoryStorage())
    .use(new botbuilder_1.BotStateManager())
    .onReceive((context) => {
    if (context.request.type === 'message') {
        // Check for cancel
        const utterance = (context.request.text || '').trim().toLowerCase();
        if (utterance === 'menu' || utterance === 'cancel') {
            dialogs.endAll(context);
        }
        // Continue the current dialog
        return dialogs.continue(context).then(() => {
            // Show menu if no response queued.
            if (!context.responded) {
                return dialogs.begin(context, 'mainMenu');
            }
        });
    }
});
// Add prompts
dialogs.add('choicePrompt', new botbuilder_dialogs_1.ChoicePrompt());
dialogs.add('confirmPrompt', new botbuilder_dialogs_1.ConfirmPrompt());
dialogs.add('datetimePrompt', new botbuilder_dialogs_1.DatetimePrompt());
dialogs.add('numberPrompt', new botbuilder_dialogs_1.NumberPrompt());
dialogs.add('textPrompt', new botbuilder_dialogs_1.TextPrompt());
const listStyle = { style: botbuilder_dialogs_1.ChoicePromptStyle.list };
const noneStyle = { style: botbuilder_dialogs_1.ChoicePromptStyle.none };
//-----------------------------------------------
// Main Menu
//-----------------------------------------------
dialogs.add('mainMenu', [
    function (context) {
        function choice(title, value) {
            return {
                value: value,
                action: { type: botbuilder_1.ActionTypes.ImBack, title: title, value: title }
            };
        }
        return dialogs.prompt(context, 'choicePrompt', `Select a demo to run:`, [
            choice('choice', 'choiceDemo'),
            choice('confirm', 'confirmDemo'),
            choice('datetime', 'datetimeDemo'),
            choice('number', 'numberDemo'),
            choice('text', 'textDemo'),
            choice('<all>', 'runAll')
        ], listStyle);
    },
    function (context, choice) {
        if (choice.value === 'runAll') {
            return dialogs.replace(context, choice.value);
        }
        else {
            context.reply(`The demo will loop so say "menu" or "cancel" to end.`);
            return dialogs.replace(context, 'loop', { dialogId: choice.value });
        }
    }
]);
dialogs.add('loop', [
    function (context, args) {
        dialogs.getInstance(context).state = args;
        return dialogs.begin(context, args.dialogId);
    },
    function (context) {
        const args = dialogs.getInstance(context).state;
        return dialogs.replace(context, 'loop', args);
    }
]);
dialogs.add('runAll', [
    (context) => dialogs.begin(context, 'choiceDemo'),
    (context) => dialogs.begin(context, 'confirmDemo'),
    (context) => dialogs.begin(context, 'datetimeDemo'),
    (context) => dialogs.begin(context, 'numberDemo'),
    (context) => dialogs.begin(context, 'textDemo'),
    (context) => dialogs.replace(context, 'mainMenu')
]);
//-----------------------------------------------
// Choice Demo
//-----------------------------------------------
dialogs.add('choiceDemo', [
    function (context) {
        return dialogs.prompt(context, 'choicePrompt', `choice: select a color`, ['red', 'green', 'blue'], listStyle);
    },
    function (context, choice) {
        context.reply(`Recognized choice: ${JSON.stringify(choice)}`);
        return dialogs.end(context);
    }
]);
//-----------------------------------------------
// Confirm Demo
//-----------------------------------------------
dialogs.add('confirmDemo', [
    function (context) {
        return dialogs.prompt(context, 'confirmPrompt', `confirm: answer "yes" or "no"`, noneStyle);
    },
    function (context, value) {
        context.reply(`Recognized value: ${value}`);
        return dialogs.end(context);
    }
]);
//-----------------------------------------------
// Confirm Demo
//-----------------------------------------------
dialogs.add('datetimeDemo', [
    function (context) {
        return dialogs.prompt(context, 'datetimePrompt', `datetime: enter a datetime`);
    },
    function (context, values) {
        context.reply(`Recognized values: ${JSON.stringify(values)}`);
        return dialogs.end(context);
    }
]);
//-----------------------------------------------
// Number Demo
//-----------------------------------------------
dialogs.add('numberDemo', [
    function (context) {
        return dialogs.prompt(context, 'numberPrompt', `number: enter a number`);
    },
    function (context, value) {
        context.reply(`Recognized value: ${value}`);
        return dialogs.end(context);
    }
]);
//-----------------------------------------------
// Text Demo
//-----------------------------------------------
dialogs.add('textDemo', [
    function (context) {
        return dialogs.prompt(context, 'textPrompt', `text: enter some text`);
    },
    function (context, value) {
        context.reply(`Recognized value: ${value}`);
        return dialogs.end(context);
    }
]);
//# sourceMappingURL=app.js.map