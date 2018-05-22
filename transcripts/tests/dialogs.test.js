const assert = require('assert');

const { BotState, UserState, MemoryStorage, TestAdapter, ConversationState } = require('botbuilder-core-extensions');
const { createChoicePrompt, ListStyle } = require('botbuilder-prompts');
const {
    DialogSet, TextPrompt, ConfirmPrompt, ChoicePrompt, DatetimePrompt, NumberPrompt,
    AttachmentPrompt, FoundChoice, Choice, FoundDatetime
} = require('botbuilder-dialogs');

const TranscriptUtilities = require('../../libraries/botbuilder-core-extensions/tests/transcriptUtilities');

function TestBotWithTranscript(transcriptPath, botLogicFactoryFun) {
    var loadFun = transcriptPath.endsWith('.chat') ? TranscriptUtilities.getActivitiesFromChat : TranscriptUtilities.getActivitiesFromTranscript;
    return function (done) {
        loadFun(transcriptPath).then(activities => {
            const convoState = new ConversationState(new MemoryStorage());
            var adapter = new TestAdapter(botLogicFactoryFun(convoState));
            adapter.use(convoState);
            return adapter.testActivities(activities)
                .then(done)
                .catch(done);
        });
    }
}

describe(`Prompts using transcripts`, function () {
    this.timeout(5000);

    it('AttchmentPrompt', TestBotWithTranscript('../DialogsTests/AttachmentPrompt.transcript', AttachmentPromptLogic));

    it('ChoicePrompt', TestBotWithTranscript('../DialogsTests/ChoicePrompt.chat', ChoicePromptLogic));
    it('ChoicePrompt - Retry', TestBotWithTranscript('../DialogsTests/ChoicePromptRetry.chat', ChoicePromptLogic));

    it('DateTime', TestBotWithTranscript('../DialogsTests/DateTimePrompt.chat', DateTimePromptLogic));
    it('DateTime - Retry', TestBotWithTranscript('../DialogsTests/DateTimePromptRetry.chat', DateTimePromptLogic));

    it('Number', TestBotWithTranscript('../DialogsTests/NumberPrompt.chat', NumberPromptLogic));
    it('Number - Retry', TestBotWithTranscript('../DialogsTests/NumberPromptRetry.chat', NumberPromptLogic));
    it('Number - Custom Validator', TestBotWithTranscript('../DialogsTests/NumberPromptValidator.chat', NumberPromptCustomValidatorLogic));

    it('Text', TestBotWithTranscript('../DialogsTests/TextPrompt.chat', TextPromptLogic));
    it('Text - Custom Validator', TestBotWithTranscript('../DialogsTests/TextPromptValidator.chat', TextPromptCustomValidatorLogic));

    it('ConfirmPrompt', TestBotWithTranscript('../DialogsTests/ConfirmPrompt.chat', ConfirmPromptLogic));
    it('ConfirmPrompt - Retry', TestBotWithTranscript('../DialogsTests/ConfirmPromptRetry.chat', ConfirmPromptLogic));
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

function NumberPromptLogic(state) {

    const dialogs = new DialogSet();
    const prompt = new NumberPrompt();
    dialogs.add('prompt', prompt);
    dialogs.add('start', [
        async function (dc) {
            await dc.prompt('prompt', 'Enter a number.', { retryPrompt: `You must enter a number.` });
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
            await dc.prompt('prompt', 'Enter a number.', { retryPrompt: `You must enter a positive number less than 100.` });
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

function TextPromptLogic(state) {

    const dialogs = new DialogSet();
    const prompt = new TextPrompt();
    dialogs.add('prompt', prompt);
    dialogs.add('start', [
        async function (dc) {
            await dc.prompt('prompt', 'Enter some text.');
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

function TextPromptCustomValidatorLogic(state) {

    const dialogs = new DialogSet();
    const prompt = new TextPrompt((context, text) => {
        if(text.length <= 3) {
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