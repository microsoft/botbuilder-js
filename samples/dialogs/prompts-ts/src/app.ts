import {
    BotFrameworkAdapter, MemoryStorage, ConversationState, ActionTypes, Attachment,
    MessageFactory
} from 'botbuilder';
import { 
    DialogSet, TextPrompt, ConfirmPrompt, ChoicePrompt, DatetimePrompt, NumberPrompt, 
    AttachmentPrompt, FoundChoice, Choice, FoundDatetime
} from 'botbuilder-dialogs';
import * as restify from 'restify';

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

// Add conversation state middleware
const conversationState = new ConversationState(new MemoryStorage());
adapter.use(conversationState);

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, async (context) => {
        if (context.activity.type === 'message') {
            // Create dialog context
            const state = conversationState.get(context);
            const dc = dialogs.createContext(context, state);

            // Check for cancel
            const utterance = (context.activity.text || '').trim().toLowerCase();
            if (utterance === 'menu' || utterance === 'cancel') { 
                await dc.endAll(); 
            }
            
            // Continue the current dialog
            await dc.continueDialog();

            // Show menu if no response sent
            if (!context.responded) {
                await dc.beginDialog('mainMenu');
            }
        }
    });
});

const dialogs = new DialogSet();
    
// Add prompts
dialogs.add('choicePrompt', new ChoicePrompt());
dialogs.add('confirmPrompt', new ConfirmPrompt());
dialogs.add('datetimePrompt', new DatetimePrompt());
dialogs.add('numberPrompt', new NumberPrompt());
dialogs.add('textPrompt', new TextPrompt());
dialogs.add('attachmentPrompt', new AttachmentPrompt());

    
//-----------------------------------------------
// Main Menu
//-----------------------------------------------

dialogs.add('mainMenu', [
    async function(dc) {
        function choice(title: string, value: string): Choice {
            return {
                value: value,
                action: { type: ActionTypes.ImBack, title: title, value: title }
            };
        }
        await dc.prompt('choicePrompt', `Select a demo to run:`, [
            choice('choice', 'choiceDemo'),
            choice('confirm', 'confirmDemo'),
            choice('datetime', 'datetimeDemo'),
            choice('number', 'numberDemo'),
            choice('text', 'textDemo'),
            choice('attachment', 'attachmentDemo'),
            choice('<all>', 'runAll')
        ]);
    },
    async function(dc, choice: FoundChoice) {
        if (choice.value === 'runAll') {
            await dc.replace(choice.value);
        } else {
            await dc.context.sendActivity(`The demo will loop so say "menu" or "cancel" to end.`);
            await dc.replace('loop', { dialogId: choice.value });
        }
    }
]);

dialogs.add('loop', [
    async function(dc, args: { dialogId: string; }) {
        dc.activeDialog.state = args;
        await dc.beginDialog(args.dialogId);
    },
    async function(dc) {
        const args = dc.activeDialog.state;
        await dc.replace('loop', args);
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
    async function(dc) {
        await dc.prompt('choicePrompt', `choice: select a color`, ['red', 'green', 'blue']);
    },
    async function(dc, choice: FoundChoice) {
        await dc.context.sendActivity(`Recognized choice: ${JSON.stringify(choice)}`);
        await dc.endDialog();
    }
]);


//-----------------------------------------------
// Confirm Demo
//-----------------------------------------------

dialogs.add('confirmDemo', [
    async function(dc) {
        await dc.prompt('confirmPrompt', `confirm: answer "yes" or "no"`);
    },
    async function(dc, value: boolean) {
        await dc.context.sendActivity(`Recognized value: ${value}`);
        await dc.endDialog();
    }
]);


//-----------------------------------------------
// Datetime Demo
//-----------------------------------------------

dialogs.add('datetimeDemo', [
    async function(dc) {
        await dc.prompt('datetimePrompt', `datetime: enter a datetime`);
    },
    async function(dc, values: FoundDatetime[]) {
        await dc.context.sendActivity(`Recognized values: ${JSON.stringify(values)}`);
        await dc.endDialog();
    }
]);


//-----------------------------------------------
// Number Demo
//-----------------------------------------------

dialogs.add('numberDemo', [
    async function(dc) {
        await dc.prompt('numberPrompt', `number: enter a number`);
    },
    async function(dc, value: number) {
        await dc.context.sendActivity(`Recognized value: ${value}`);
        await dc.endDialog();
    }
]);


//-----------------------------------------------
// Text Demo
//-----------------------------------------------

dialogs.add('textDemo', [
    async function(dc) {
        await dc.prompt('textPrompt', `text: enter some text`);
    },
    async function(dc, value: string) {
        await dc.context.sendActivity(`Recognized value: ${value}`);
        await dc.endDialog();
    }
]);


//-----------------------------------------------
// Attachment Demo
//-----------------------------------------------

dialogs.add('attachmentDemo', [
    async function(dc) {
        await dc.prompt('attachmentPrompt', `attachment: upload image(s)`);
    },
    async function(dc, values: Attachment[]) {
        await dc.context.sendActivity(MessageFactory.carousel(values, `Uploaded ${values.length} Attachment(s)`));
        await dc.endDialog();
    }
]);
