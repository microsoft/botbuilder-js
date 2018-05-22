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
    
    it('ConfirmPrompt', TestBotWithTranscript('../DialogsTests/ConfirmPrompt.chat', ConfirmPromptLogic));
    it('ConfirmPrompt - Retry', TestBotWithTranscript('../DialogsTests/ConfirmPromptRetry.chat', ConfirmPromptLogic));

    it('ConfirmPrompt', TestBotWithTranscript('../DialogsTests/ConfirmPrompt.chat', ConfirmPromptLogic));
    it('ConfirmPrompt - Retry', TestBotWithTranscript('../DialogsTests/ConfirmPromptRetry.chat', ConfirmPromptLogic));

    it('ChoicePrompt', TestBotWithTranscript('../DialogsTests/ChoicePrompt.chat', ChoicePromptLogic));
    it('ChoicePrompt - Retry', TestBotWithTranscript('../DialogsTests/ChoicePromptRetry.chat', ChoicePromptLogic));

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