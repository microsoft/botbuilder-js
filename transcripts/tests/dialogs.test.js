const assert = require('assert');
const { createChoicePrompt, ListStyle } = require('botbuilder-prompts');
const {
    DialogSet, TextPrompt, ConfirmPrompt, ChoicePrompt, DatetimePrompt, NumberPrompt,
    AttachmentPrompt, FoundChoice, Choice, FoundDatetime
} = require('botbuilder-dialogs');
const { assertBotLogicWithTranscript } = require('../../libraries/botbuilder-core-extensions/tests/transcriptUtilities');

describe(`Prompt Tests using transcripts`, function () {
    this.timeout(5000);

    it('AttachmentPrompt', assertBotLogicWithTranscript('DialogsTests/AttachmentPrompt.chat', AttachmentPromptLogic));

    it('ChoicePrompt', assertBotLogicWithTranscript('DialogsTests/ChoicePrompt.chat', ChoicePromptLogic));

    it('ConfirmPrompt', assertBotLogicWithTranscript('DialogsTests/ConfirmPrompt.chat', ConfirmPromptLogic));

    it('DateTime', assertBotLogicWithTranscript('DialogsTests/DateTimePrompt.chat', DateTimePromptLogic));

    it('Number', assertBotLogicWithTranscript('DialogsTests/NumberPrompt.chat', NumberPromptCustomValidatorLogic));

    it('Text', assertBotLogicWithTranscript('DialogsTests/TextPrompt.chat', TextPromptCustomValidatorLogic));

    it('Waterfall', assertBotLogicWithTranscript('DialogsTests/Waterfall.chat', WaterfallLogic))
    it('WaterfallPrompt', assertBotLogicWithTranscript('DialogsTests/WaterfallPrompt.chat', WaterfallPromptLogic))
    it('WaterfallNested', assertBotLogicWithTranscript('DialogsTests/WaterfallNested.chat', WaterfallNestedLogic))
});

function AttachmentPromptLogic(state) {

    const dialogs = new DialogSet();
    const prompt = new AttachmentPrompt();
    dialogs.add('prompt', prompt);
    dialogs.add('start', [
        async function (dc) {
            await dc.prompt('prompt', 'please add an attachment.');
        },
        async function (dc, attachment) {
            await dc.context.sendActivity(attachment[0].content);
            await dc.end();
        }
    ]);

    return async (context) => {
        const dc = dialogs.createContext(context, state);
        await dc.continue();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.begin('start');
        }
    }
};

function ChoicePromptLogic(state) {

    const colorChoices = ['red', 'green', 'blue'];
    const dialogs = new DialogSet();
    const choicePrompt = new ChoicePrompt().style(ListStyle.inline);
    dialogs.add('choicePrompt', choicePrompt);
    dialogs.add('start', [
        async function (dc) {
            await dc.prompt('choicePrompt', 'favorite color?', colorChoices, {
                retryPrompt: `I didn't catch that. Select a color from the list.`
            });
        },
        async function (dc, choice) {
            const color = choice.value;
            await dc.context.sendActivity(`Bot received the choice '${color}'.`);
            await dc.end();
        }
    ]);

    return async (context) => {
        const dc = dialogs.createContext(context, state);
        await dc.continue();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.begin('start');
        }
    }
};

function DateTimePromptLogic(state) {

    const dialogs = new DialogSet();
    const prompt = new DatetimePrompt();
    dialogs.add('prompt', prompt);
    dialogs.add('start', [
        async function (dc) {
            await dc.prompt('prompt', 'What date would you like?', { retryPrompt: `Sorry, but that is not a date. What date would you like?` });
        },
        async function (dc, dateTimeResult) {
            var resolution = dateTimeResult[0];
            await dc.context.sendActivity(`Timex:'${resolution.timex}' Value:'${resolution.value}'`);
            await dc.end();
        }
    ]);

    return async (context) => {
        const dc = dialogs.createContext(context, state);
        await dc.continue();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.begin('start');
        }
    }
}

function NumberPromptCustomValidatorLogic(state) {

    const dialogs = new DialogSet();
    const prompt = new NumberPrompt((context, result) => {
        if (result < 0)
            return undefined;
        if (result > 100)
            return undefined;

        return result;
    });
    dialogs.add('prompt', prompt);
    dialogs.add('start', [
        async function (dc) {
            await dc.prompt('prompt', 'Enter a number.', { retryPrompt: `You must enter a valid positive number less than 100.` });
        },
        async function (dc, numberResult
        ) {
            await dc.context.sendActivity(`Bot received the number '${numberResult}'.`);
            await dc.end();
        }
    ]);

    return async (context) => {
        const dc = dialogs.createContext(context, state);
        await dc.continue();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.begin('start');
        }
    }
}

function TextPromptCustomValidatorLogic(state) {

    const dialogs = new DialogSet();
    const prompt = new TextPrompt((context, text) => {
        if (text.length <= 3) {
            return undefined;
        }

        return text;
    });
    dialogs.add('prompt', prompt);
    dialogs.add('start', [
        async function (dc) {
            await dc.prompt('prompt', 'Enter some text.', { retryPrompt: `Make sure the text is greater than three characters.` });
        },
        async function (dc, text
        ) {
            await dc.context.sendActivity(`Bot received the text '${text}'.`);
            await dc.end();
        }
    ]);

    return async (context) => {
        const dc = dialogs.createContext(context, state);
        await dc.continue();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.begin('start');
        }
    }
}

function ConfirmPromptLogic(state) {

    const dialogs = new DialogSet();
    const confirmPrompt = new ConfirmPrompt().style(ListStyle.none);
    dialogs.add('confirmPrompt', confirmPrompt);
    dialogs.add('start', [
        async function (dc) {
            await dc.prompt('confirmPrompt', 'Please confirm.', {
                retryPrompt: `Please confirm, say 'yes' or 'no' or something like that.`
            });
        },
        async function (dc, confirmed) {
            await dc.context.sendActivity(confirmed ? 'Confirmed.' : 'Not confirmed.');
            await dc.end();
        }
    ]);

    return async (context) => {
        const dc = dialogs.createContext(context, state);
        await dc.continue();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.begin('start');
        }
    }
};

function WaterfallLogic(state) {
    const dialogs = new DialogSet();
    dialogs.add('start', [
        (dc) => dc.context.sendActivity('step1'),
        (dc) => dc.context.sendActivity('step2'),
        (dc) => dc.context.sendActivity('step3')
    ]);

    return async (context) => {
        const dc = dialogs.createContext(context, state);
        await dc.continue();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.begin('start');
        }
    }
}

function WaterfallPromptLogic(state) {
    const dialogs = new DialogSet();
    dialogs.add('number', new NumberPrompt());
    dialogs.add('test-waterfall', [
        async (dc) => {
            await dc.context.sendActivity('step1');
            await dc.prompt('number', 'Enter a number.', { retryPrompt: 'It must be a number' })
        },
        async (dc, args) => {
            if (args != null) {
                var numberResult = args;
                await dc.context.sendActivity(`Thanks for '${numberResult}'`);
            }

            await dc.context.sendActivity('step2');
            await dc.prompt('number', 'Enter a number.', { retryPrompt: 'It must be a number' });
        },
        async (dc, args) => {
            if (args != null) {
                var numberResult = args;
                await dc.context.sendActivity(`Thanks for '${numberResult}'`);
            }

            await dc.context.sendActivity('step3');
            await dc.end({ value: 'All Done!' });
        }

    ]);

    return async (context) => {
        const dc = dialogs.createContext(context, state);
        await dc.continue();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.begin('test-waterfall');
        }
    }
}

function WaterfallNestedLogic(state) {
    const dialogs = new DialogSet();
    dialogs.add('test-waterfall-a', WaterfallNestedA);
    dialogs.add('test-waterfall-b', WaterfallNestedB);
    dialogs.add('test-waterfall-c', WaterfallNestedC);

    return async (context) => {
        const dc = dialogs.createContext(context, state);
        await dc.continue();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.begin('test-waterfall-a');
        }
    }
}

const WaterfallNestedA = [
    async (dc) => {
        dc.context.sendActivity('step1');
        await dc.begin('test-waterfall-b');
    },
    async (dc) => {
        await dc.context.sendActivity("step2");
        await dc.begin("test-waterfall-c");
    }
];

const WaterfallNestedB = [
    async (dc) => dc.context.sendActivity('step1.1'),
    async (dc) => dc.context.sendActivity('step1.2')
];

const WaterfallNestedC = [
    async (dc) => dc.context.sendActivity('step2.1'),
    async (dc) => dc.context.sendActivity('step2.2')
];