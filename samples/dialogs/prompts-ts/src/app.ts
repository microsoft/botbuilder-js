import { 
    Bot, MemoryStorage, BotStateManager, ActionTypes, CardAction, Attachment, MessageStyler
} from 'botbuilder';
import { 
    DialogSet, TextPrompt, ConfirmPrompt, ConfirmPromptOptions, ChoicePrompt, ChoicePromptOptions, 
    DatetimePrompt, NumberPrompt, AttachmentPrompt, FoundChoice, Choice, FoundDatetime, ListStyle 
} from 'botbuilder-dialogs';
import { BotFrameworkAdapter } from 'botbuilder-services';
import * as restify from 'restify';

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter and listen to servers '/api/messages' route.
const adapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});
server.post('/api/messages', <any>adapter.listen());

const dialogs = new DialogSet();

// Initialize bot by passing it adapter and middleware
const bot = new Bot(adapter)
    .use(new MemoryStorage())
    .use(new BotStateManager())
    .onReceive((context) => {
        if (context.request.type === 'message') {
            // Check for cancel
            const utterance = (context.request.text || '').trim().toLowerCase();
            if (utterance === 'menu' || utterance === 'cancel') { dialogs.endAll(context) }

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
    function (context) {
        function choice(title: string, value: string): Choice {
            return {
                value: value,
                action: { type: ActionTypes.ImBack, title: title, value: title }
            };
        }
        const options: ChoicePromptOptions = {
            choices: [
                choice('choice', 'choiceDemo'),
                choice('confirm', 'confirmDemo'),
                choice('datetime', 'datetimeDemo'),
                choice('number', 'numberDemo'),
                choice('text', 'textDemo'),
                choice('attachment', 'attachmentDemo'),
                choice('<all>', 'runAll')
            ],
            style: ListStyle.list
        }
        return dialogs.prompt(context, 'choicePrompt', `Select a demo to run:`, options);
    },
    function (context, choice: FoundChoice) {
        if (choice.value === 'runAll') {
            return dialogs.replace(context, choice.value);
        } else {
            context.reply(`The demo will loop so say "menu" or "cancel" to end.`);
            return dialogs.replace(context, 'loop', { dialogId: choice.value });
        }
    }
]);

dialogs.add('loop', [
    function (context, args: { dialogId: string; }) {
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
    (context) => dialogs.begin(context, 'attachmentDemo'),
    (context) => dialogs.replace(context, 'mainMenu')
]);


//-----------------------------------------------
// Choice Demo
//-----------------------------------------------

dialogs.add('choiceDemo', [
    function (context) {
        const options: ChoicePromptOptions = {
            choices: ['red', 'green', 'blue'],
            style: ListStyle.list
        }
        return dialogs.prompt(context, 'choicePrompt', `choice: select a color`, options);
    },
    function (context, choice: FoundChoice) {
        context.reply(`Recognized choice: ${JSON.stringify(choice)}`);
        return dialogs.end(context);
    }
]);


//-----------------------------------------------
// Confirm Demo
//-----------------------------------------------

dialogs.add('confirmDemo', [
    function (context) {
        const options: ConfirmPromptOptions = { style: ListStyle.none }
        return dialogs.prompt(context, 'confirmPrompt', `confirm: answer "yes" or "no"`, options);
    },
    function (context, value: boolean) {
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
    function (context, values: FoundDatetime[]) {
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
    function (context, value: number) {
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
    function (context, value: string) {
        context.reply(`Recognized value: ${value}`);
        return dialogs.end(context);
    }
]);


//-----------------------------------------------
// Attachment Demo
//-----------------------------------------------

dialogs.add('attachmentDemo', [
    function (context) {
        return dialogs.prompt(context, 'attachmentPrompt', `attachment: upload image(s)`);
    },
    function (context, values: Attachment[]) {
        context.reply(MessageStyler.carousel(values, `Uploaded ${values.length} Attachment(s)`));
        return dialogs.end(context);
    }
]);
