const { createTextPrompt } = require('botbuilder-prompts');

module.exports = function createBotLogic(conversationState) {

    // Create our namePrompt with our validator
    const namePrompt = createTextPrompt(nameValidator);

    return async (context) => {
        const state = conversationState.get(context);
        if (context.activity.type === 'conversationUpdate' && context.activity.membersAdded[0].name !== 'Bot') {
            state.prompt = 'name';
            await namePrompt.prompt(context, "Hello, I'm the demo bot. What is your name?");
        } else if (context.activity.type === 'message') {
            // If the user isn't in a prompt, ask for their name
            if (!('prompt' in state)) {
                state.prompt = 'name';
                await namePrompt.prompt(context, 'What is your name?')
            } else {
                // Attempt to recognize the users response
                let name = await namePrompt.recognize(context);
                if (name !== undefined) {
                    await context.sendActivity(`${name} is a great name!`);
                    state.prompt = undefined;
                } else {
                    // The user provided an invalid response, so re-prompt the user
                    await namePrompt.prompt(context, 'Please provide a name longer than 2 characters.');
                }
            }
        }
    }
}

// Create a validator for our namePrompt
function nameValidator(context, value) {
    if (value.length < 2) {
        return undefined;
    }
    return value;
}