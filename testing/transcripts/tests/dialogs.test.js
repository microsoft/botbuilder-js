const { ActivityTypes } = require('botbuilder');
const {
    DialogSet,
    TextPrompt,
    ConfirmPrompt,
    ChoicePrompt,
    NumberPrompt,
    AttachmentPrompt,
    WaterfallDialog,
    ListStyle,
    DateTimePrompt,
} = require('botbuilder-dialogs');
const assertBotLogicWithTranscript = require('../../../libraries/botbuilder-core/tests/transcriptUtilities')
    .assertBotLogicWithBotBuilderTranscript;

describe(`Prompt Tests using transcripts`, function () {
    this.timeout(10000);

    it('AttachmentPrompt', assertBotLogicWithTranscript('DialogsTests/AttachmentPrompt.chat', AttachmentPromptLogic));

    it('ChoicePrompt', assertBotLogicWithTranscript('DialogsTests/ChoicePrompt.chat', ChoicePromptLogic));

    it('ConfirmPrompt', assertBotLogicWithTranscript('DialogsTests/ConfirmPrompt.chat', ConfirmPromptLogic));

    it('DateTime', assertBotLogicWithTranscript('DialogsTests/DateTimePrompt.chat', DateTimePromptLogic));

    it('Number', assertBotLogicWithTranscript('DialogsTests/NumberPrompt.chat', NumberPromptCustomValidatorLogic));

    it('Text', assertBotLogicWithTranscript('DialogsTests/TextPrompt.chat', TextPromptCustomValidatorLogic));

    it('Waterfall', assertBotLogicWithTranscript('DialogsTests/Waterfall.chat', WaterfallLogic));
    it('WaterfallPrompt', assertBotLogicWithTranscript('DialogsTests/WaterfallPrompt.chat', WaterfallPromptLogic));
    it('WaterfallNested', assertBotLogicWithTranscript('DialogsTests/WaterfallNested.chat', WaterfallNestedLogic));
});

function AttachmentPromptLogic(state) {
    const dialogState = state.createProperty('dialogState');
    const dialogs = new DialogSet(dialogState);
    dialogs.add(new AttachmentPrompt('prompt'));
    dialogs.add(
        new WaterfallDialog('start', [
            async function (dc) {
                await dc.prompt('prompt', 'please add an attachment.');
            },
            async function (dc) {
                const [attachment] = dc.context.activity.attachments;
                await dc.context.sendActivity(attachment.content);
                await dc.endDialog();
            },
        ])
    );

    return async (context) => {
        if (context.activity.type == ActivityTypes.ConversationUpdate) {
            return;
        }

        const dc = await dialogs.createContext(context);
        await dc.continueDialog();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.beginDialog('start');
        }
    };
}

function ChoicePromptLogic(state) {
    const colorChoices = ['red', 'green', 'blue'];
    const dialogState = state.createProperty('dialogState');
    const dialogs = new DialogSet(dialogState);
    const choicePrompt = new ChoicePrompt('prompt');
    choicePrompt.style = ListStyle.inline;
    dialogs.add(choicePrompt);
    dialogs.add(
        new WaterfallDialog('start', [
            async function (dc) {
                await dc.prompt(
                    'prompt',
                    { prompt: 'favorite color?', retryPrompt: "I didn't catch that. Select a color from the list." },
                    colorChoices
                );
            },
            async function (dc) {
                const color = dc.result.value;
                await dc.context.sendActivity(`Bot received the choice '${color}'.`);
                await dc.endDialog();
            },
        ])
    );

    return async (context) => {
        if (context.activity.type == ActivityTypes.ConversationUpdate) {
            return;
        }

        const dc = await dialogs.createContext(context, state);
        await dc.continueDialog();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.beginDialog('start');
        }
    };
}

function DateTimePromptLogic(state) {
    const dialogState = state.createProperty('dialogState');
    const dialogs = new DialogSet(dialogState);
    dialogs.add(new DateTimePrompt('prompt'));
    dialogs.add(
        new WaterfallDialog('start', [
            async function (dc) {
                await dc.prompt('prompt', {
                    prompt: 'What date would you like?',
                    retryPrompt: 'Sorry, but that is not a date. What date would you like?',
                });
            },
            async function (dc) {
                var [resolution] = dc.result;
                await dc.context.sendActivity(`Timex:'${resolution.timex}' Value:'${resolution.value}'`);
                await dc.endDialog();
            },
        ])
    );

    return async (context) => {
        if (context.activity.type == ActivityTypes.ConversationUpdate) {
            return;
        }

        const dc = await dialogs.createContext(context, state);
        await dc.continueDialog();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.beginDialog('start');
        }
    };
}

function NumberPromptCustomValidatorLogic(state) {
    const dialogState = state.createProperty('dialogState');
    const dialogs = new DialogSet(dialogState);
    const prompt = new NumberPrompt('prompt', (prompt) => {
        if (prompt.recognized.value < 0) return undefined;
        if (prompt.recognized.value > 100) return undefined;

        return prompt.recognized.value;
    });
    dialogs.add(prompt);
    dialogs.add(
        new WaterfallDialog('start', [
            async function (dc) {
                await dc.prompt('prompt', {
                    prompt: 'Enter a number.',
                    retryPrompt: 'You must enter a valid positive number less than 100.',
                });
            },
            async function (dc) {
                await dc.context.sendActivity(`Bot received the number '${dc.result}'.`);
                await dc.endDialog();
            },
        ])
    );

    return async (context) => {
        if (context.activity.type == ActivityTypes.ConversationUpdate) {
            return;
        }

        const dc = await dialogs.createContext(context, state);
        await dc.continueDialog();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.beginDialog('start');
        }
    };
}

function TextPromptCustomValidatorLogic(state) {
    const dialogState = state.createProperty('dialogState');
    const dialogs = new DialogSet(dialogState);
    const prompt = new TextPrompt('prompt', (prompt) => {
        if (prompt.recognized.value.length <= 3) {
            return undefined;
        }

        return prompt.recognized.value;
    });
    dialogs.add(prompt);
    dialogs.add(
        new WaterfallDialog('start', [
            async function (dc) {
                await dc.prompt('prompt', {
                    prompt: 'Enter some text.',
                    retryPrompt: 'Make sure the text is greater than three characters.',
                });
            },
            async function (dc) {
                await dc.context.sendActivity(`Bot received the text '${dc.result}'.`);
                await dc.endDialog();
            },
        ])
    );

    return async (context) => {
        if (context.activity.type == ActivityTypes.ConversationUpdate) {
            return;
        }

        const dc = await dialogs.createContext(context, state);
        await dc.continueDialog();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.beginDialog('start');
        }
    };
}

function ConfirmPromptLogic(state) {
    const dialogState = state.createProperty('dialogState');
    const dialogs = new DialogSet(dialogState);
    const confirmPrompt = new ConfirmPrompt('prompt');
    confirmPrompt.style = ListStyle.none;
    dialogs.add(confirmPrompt);
    dialogs.add(
        new WaterfallDialog('start', [
            async function (dc) {
                await dc.prompt('prompt', {
                    prompt: 'Please confirm.',
                    retryPrompt: "Please confirm, say 'yes' or 'no' or something like that.",
                });
            },
            async function (dc) {
                const confirmed = dc.result;
                await dc.context.sendActivity(confirmed ? 'Confirmed.' : 'Not confirmed.');
                await dc.endDialog();
            },
        ])
    );

    return async (context) => {
        if (context.activity.type == ActivityTypes.ConversationUpdate) {
            return;
        }

        const dc = await dialogs.createContext(context, state);
        await dc.continueDialog();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.beginDialog('start');
        }
    };
}

function WaterfallLogic(state) {
    const dialogState = state.createProperty('dialogState');
    const dialogs = new DialogSet(dialogState);
    dialogs.add(
        new WaterfallDialog('start', [
            (dc) => dc.context.sendActivity('step1'),
            (dc) => dc.context.sendActivity('step2'),
            (dc) => dc.context.sendActivity('step3'),
        ])
    );

    return async (context) => {
        if (context.activity.type == ActivityTypes.ConversationUpdate) {
            return;
        }

        const dc = await dialogs.createContext(context, state);
        await dc.continueDialog();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.beginDialog('start');
        }
    };
}

function WaterfallPromptLogic(state) {
    const dialogState = state.createProperty('dialogState');
    const dialogs = new DialogSet(dialogState);
    dialogs.add(new NumberPrompt('number'));
    dialogs.add(
        new WaterfallDialog('start', [
            async (dc) => {
                await dc.context.sendActivity('step1');
                await dc.prompt('number', { prompt: 'Enter a number.', retryPrompt: 'It must be a number' });
            },
            async (dc) => {
                if (dc.result != null) {
                    await dc.context.sendActivity(`Thanks for '${dc.result}'`);
                }

                await dc.context.sendActivity('step2');
                await dc.prompt('number', { prompt: 'Enter a number.', retryPrompt: 'It must be a number' });
            },
            async (dc) => {
                if (dc.result != null) {
                    await dc.context.sendActivity(`Thanks for '${dc.result}'`);
                }

                await dc.context.sendActivity('step3');
                await dc.endDialog({ value: 'All Done!' });
            },
        ])
    );

    return async (context) => {
        if (context.activity.type == ActivityTypes.ConversationUpdate) {
            return;
        }

        const dc = await dialogs.createContext(context, state);
        await dc.continueDialog();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.beginDialog('start');
        }
    };
}

function WaterfallNestedLogic(state) {
    const dialogState = state.createProperty('dialogState');
    const dialogs = new DialogSet(dialogState);
    dialogs.add(
        new WaterfallDialog('test-waterfall-a', [
            async (dc) => {
                dc.context.sendActivity('step1');
                await dc.beginDialog('test-waterfall-b');
            },
            async (dc) => {
                await dc.context.sendActivity('step2');
                await dc.beginDialog('test-waterfall-c');
            },
        ])
    );
    dialogs.add(
        new WaterfallDialog('test-waterfall-b', [
            async (dc) => dc.context.sendActivity('step1.1'),
            async (dc) => dc.context.sendActivity('step1.2'),
        ])
    );
    dialogs.add(
        new WaterfallDialog('test-waterfall-c', [
            async (dc) => dc.context.sendActivity('step2.1'),
            async (dc) => dc.context.sendActivity('step2.2'),
        ])
    );

    return async (context) => {
        if (context.activity.type == ActivityTypes.ConversationUpdate) {
            return;
        }

        const dc = await dialogs.createContext(context, state);
        await dc.continueDialog();

        // Check to see if anyone replied. If not then start echo dialog
        if (!context.responded) {
            await dc.beginDialog('test-waterfall-a');
        }
    };
}
