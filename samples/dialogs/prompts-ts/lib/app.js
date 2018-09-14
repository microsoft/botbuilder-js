"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const restify = require("restify");
// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});
// Create adapter
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
// Add conversation state middleware
const conversationState = new botbuilder_1.ConversationState(new botbuilder_1.MemoryStorage());
adapter.use(conversationState);
// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, (context) => __awaiter(this, void 0, void 0, function* () {
        if (context.activity.type === 'message') {
            // Create dialog context
            const state = conversationState.get(context);
            const dc = dialogs.createContext(context, state);
            // Check for cancel
            const utterance = (context.activity.text || '').trim().toLowerCase();
            if (utterance === 'menu' || utterance === 'cancel') {
                yield dc.endAll();
            }
            // Continue the current dialog
            yield dc.continueDialog();
            // Show menu if no response sent
            if (!context.responded) {
                yield dc.beginDialog('mainMenu');
            }
        }
    }));
});
const dialogs = new botbuilder_dialogs_1.DialogSet();
// Add prompts
dialogs.add('choicePrompt', new botbuilder_dialogs_1.ChoicePrompt());
dialogs.add('confirmPrompt', new botbuilder_dialogs_1.ConfirmPrompt());
dialogs.add('datetimePrompt', new botbuilder_dialogs_1.DatetimePrompt());
dialogs.add('numberPrompt', new botbuilder_dialogs_1.NumberPrompt());
dialogs.add('textPrompt', new botbuilder_dialogs_1.TextPrompt());
dialogs.add('attachmentPrompt', new botbuilder_dialogs_1.AttachmentPrompt());
//-----------------------------------------------
// Main Menu
//-----------------------------------------------
dialogs.add('mainMenu', [
    function (dc) {
        return __awaiter(this, void 0, void 0, function* () {
            function choice(title, value) {
                return {
                    value: value,
                    action: { type: botbuilder_1.ActionTypes.ImBack, title: title, value: title }
                };
            }
            yield dc.prompt('choicePrompt', `Select a demo to run:`, [
                choice('choice', 'choiceDemo'),
                choice('confirm', 'confirmDemo'),
                choice('datetime', 'datetimeDemo'),
                choice('number', 'numberDemo'),
                choice('text', 'textDemo'),
                choice('attachment', 'attachmentDemo'),
                choice('<all>', 'runAll')
            ]);
        });
    },
    function (dc, choice) {
        return __awaiter(this, void 0, void 0, function* () {
            if (choice.value === 'runAll') {
                yield dc.replace(choice.value);
            }
            else {
                yield dc.context.sendActivity(`The demo will loop so say "menu" or "cancel" to end.`);
                yield dc.replace('loop', { dialogId: choice.value });
            }
        });
    }
]);
dialogs.add('loop', [
    function (dc, args) {
        return __awaiter(this, void 0, void 0, function* () {
            dc.activeDialog.state = args;
            yield dc.beginDialog(args.dialogId);
        });
    },
    function (dc) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = dc.activeDialog.state;
            yield dc.replace('loop', args);
        });
    }
]);
dialogs.add('runAll', [
    (dc) => dc.beginDialog('choiceDemo'),
    (dc) => dc.beginDialog('confirmDemo'),
    (dc) => dc.beginDialog('datetimeDemo'),
    (dc) => dc.beginDialog('numberDemo'),
    (dc) => dc.beginDialog('textDemo'),
    (dc) => dc.beginDialog('attachmentDemo'),
    (dc) => dc.replace('mainMenu')
]);
//-----------------------------------------------
// Choice Demo
//-----------------------------------------------
dialogs.add('choiceDemo', [
    function (dc) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dc.prompt('choicePrompt', `choice: select a color`, ['red', 'green', 'blue']);
        });
    },
    function (dc, choice) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dc.context.sendActivity(`Recognized choice: ${JSON.stringify(choice)}`);
            yield dc.endDialog();
        });
    }
]);
//-----------------------------------------------
// Confirm Demo
//-----------------------------------------------
dialogs.add('confirmDemo', [
    function (dc) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dc.prompt('confirmPrompt', `confirm: answer "yes" or "no"`);
        });
    },
    function (dc, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dc.context.sendActivity(`Recognized value: ${value}`);
            yield dc.endDialog();
        });
    }
]);
//-----------------------------------------------
// Datetime Demo
//-----------------------------------------------
dialogs.add('datetimeDemo', [
    function (dc) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dc.prompt('datetimePrompt', `datetime: enter a datetime`);
        });
    },
    function (dc, values) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dc.context.sendActivity(`Recognized values: ${JSON.stringify(values)}`);
            yield dc.endDialog();
        });
    }
]);
//-----------------------------------------------
// Number Demo
//-----------------------------------------------
dialogs.add('numberDemo', [
    function (dc) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dc.prompt('numberPrompt', `number: enter a number`);
        });
    },
    function (dc, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dc.context.sendActivity(`Recognized value: ${value}`);
            yield dc.endDialog();
        });
    }
]);
//-----------------------------------------------
// Text Demo
//-----------------------------------------------
dialogs.add('textDemo', [
    function (dc) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dc.prompt('textPrompt', `text: enter some text`);
        });
    },
    function (dc, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dc.context.sendActivity(`Recognized value: ${value}`);
            yield dc.endDialog();
        });
    }
]);
//-----------------------------------------------
// Attachment Demo
//-----------------------------------------------
dialogs.add('attachmentDemo', [
    function (dc) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dc.prompt('attachmentPrompt', `attachment: upload image(s)`);
        });
    },
    function (dc, values) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dc.context.sendActivity(botbuilder_1.MessageFactory.carousel(values, `Uploaded ${values.length} Attachment(s)`));
            yield dc.endDialog();
        });
    }
]);
//# sourceMappingURL=app.js.map