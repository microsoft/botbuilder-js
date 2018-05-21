const assert = require('assert');

const { BotState, UserState, MemoryStorage, TestAdapter, ConversationState } = require('botbuilder-core-extensions');
const { createChoicePrompt, ListStyle } = require('botbuilder-prompts');
const {
    DialogSet, TextPrompt, ConfirmPrompt, ChoicePrompt, DatetimePrompt, NumberPrompt,
    AttachmentPrompt, FoundChoice, Choice, FoundDatetime
} = require('botbuilder-dialogs');

const TranscriptUtilities = require('../../libraries/botbuilder-core-extensions/tests/transcriptUtilities');

describe(`Prompts using transcripts`, function () {
    this.timeout(5000);

    it('PromptChoice', function (done) {
        TranscriptUtilities.getActivitiesFromChat('../PromptChoice.chat').then(activities => {
            const convoState = new ConversationState(new MemoryStorage());
            var adapter = new TestAdapter(CreatePromptChoiceLogic(convoState));
            adapter.use(convoState);
            return adapter.testActivities(activities)
                .then(done)
                .catch(done);
        });
    });
});

const CreatePromptChoiceLogic = (state) => {

    const colorChoices = ['red', 'green', 'blue'];
    const dialogs = new DialogSet();
    const choicePrompt = new ChoicePrompt().style(ListStyle.inline);
    dialogs.add('choicePrompt', choicePrompt);
    dialogs.add('start', [
        async function (dc) {
            await dc.prompt('choicePrompt', 'What is your favorite color?', colorChoices, {
                retryPrompt: `I didn't catch that. Select a color from the list.`
            });
        },
        async function (dc, choice) {
            const color = choice.value;
            await dc.context.sendActivity(`I like ${color} too!`);
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