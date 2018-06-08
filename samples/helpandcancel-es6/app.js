// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { BotFrameworkAdapter, BotStateSet, ConversationState, MemoryStorage, UserState } = require('botbuilder');

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

// Add state middleware
const storage = new MemoryStorage();
const convoState = new ConversationState(storage);
const userState = new UserState(storage);
adapter.use(new BotStateSet(convoState, userState));

// Listen for incoming requests 
server.post('/api/messages/', (req, res) => {
    adapter.processActivity(req, res, (context) => {

        // On "conversationUpdate"-type activities this bot will send a greeting message to users joining the conversation.
        if (context.activity.type === 'conversationUpdate' && context.activity.membersAdded[0].name !== 'Bot') {
            return context.sendActivity(`Welcome to the HelpAndCancel-bot!`);
        } else if (context.activity.type === 'message') {
            var message = context.activity.text;
            var state = convoState.get(context);

            if (message.toLocaleLowerCase() === 'help') {
                // Help
                if (state.lastNumber !== undefined) {
                    return context.sendActivity(`Just type the number that follows ${state.lastNumber}. Or type _'cancel'_ to start a new count`);
                }

                return context.sendActivity(`Type a number and count with me`);
            } else if (message.toLocaleLowerCase() === 'cancel') {
                // Cancel
                if (state.lastNumber !== undefined) {
                    delete state.lastNumber;
                    return context.sendActivity(`Ok, canceling this iteration...`);
                }

                return context.sendActivity(`Sorry, nothing to cancel`);
            }

            if (state.lastNumber !== undefined) {
                // Count from last known number
                if (!isNaN(message)) {
                    var userNumber = parseInt(message, 10);
                    var lastNumber = state.lastNumber || 0;
                    if (userNumber === lastNumber + 1) {
                        state.lastNumber = userNumber + 1;
                        return context.sendActivity(state.lastNumber.toString());
                    }

                    return context.sendActivity(`Please, type the number that follows ${lastNumber}`);
                }

                return context.sendActivity(`Please, type just a number`);
            }

            if (!isNaN(message)) {
                // Define starting number
                state.lastNumber = parseInt(message, 10) + 1;
                return context.sendActivity(`Starting with ${state.lastNumber}`);
            }

            return context.sendActivity(`Please, type just a number`);
        }
    });
});