const { DialogSet, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');

function createBotLogic(conversationState) {

    const dialogs = new DialogSet();

    // Create prompt for name with string length validation
    dialogs.add('namePrompt', new TextPrompt(async (context, value) => {
        if (value && value.length < 2) {
            await context.sendActivity('Your name should be at least 2 characters long.');
            return undefined;
        }
        return value.trim();
    }));

    // Create prompt for age with number value validation
    dialogs.add('agePrompt', new NumberPrompt(async (context, value) => {
        if (0 > value || value > 122) {
            await context.sendActivity('Your age should be between 0 and 122.');
            return undefined;
        }
        return value;
    }));

    // Add a dialog that uses both prompts to gather information from the user
    dialogs.add('gatherInfo', [
        async (dialogContext) => {
            await dialogContext.prompt('namePrompt', 'What is your name?');
        },
        async (dialogContext, value) => {
            const state = conversationState.get(dialogContext.context);
            state.name = value;
            await dialogContext.prompt('agePrompt', 'What is your age?');
        },
        async (dialogContext, value) => {
            const state = conversationState.get(dialogContext.context);
            state.age = value;
            await dialogContext.context.sendActivity(`Your name is ${state.name} and your age is ${state.age}`);
            await dialogContext.end();
        }
    ]);

    return async (context) => {
        const state = conversationState.get(context);
        const dc = dialogs.createContext(context, state);
        const isMessage = context.activity.type === 'message';
        if (!context.responded) {
            await dc.continueDialog();
            if (!context.responded && isMessage) {
                await dc.beginDialog('gatherInfo');
            }
        }
    }
}

module.exports = createBotLogic;