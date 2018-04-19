const { BotFrameworkAdapter, MemoryStorage, ConversationState } = require('botbuilder');
const { createTextPrompt } = require('botbuilder-prompts');
const restify = require('restify');

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

// Create a validator for our namePrompt
function nameValidator(context, value) {
    if (value.length < 2) {
        return undefined;
    }
    return value;
}

// Create our namePrompt with our validator
const namePrompt = createTextPrompt(nameValidator);

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        const state = conversationState.get(context);
        if (context.activity.type === 'message') {
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
    });
});