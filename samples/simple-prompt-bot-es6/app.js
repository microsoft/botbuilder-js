// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { BotFrameworkAdapter, BotStateSet, ConversationState, MemoryStorage, UserState } = require('botbuilder');
const { createTextPrompt, createNumberPrompt } = require('botbuilder-prompts');

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

// Create the namePrompt
const namePrompt = createTextPrompt();

// Create the agePrompt with validator
const agePrompt = createNumberPrompt((context, value) => {
    if (!value || value < 13 || value > 90) {
        // Not a valid age for this demo
        return undefined;
    }

    return value;
})

// Listen for incoming requests 
server.post('/api/messages/', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        const state = convoState.get(context);
        if (context.activity.type === 'message') {

            var promptingName = 'promptingName' in state;
            var promptingAge = 'promptingAge' in state;
            var name = state.name;
            var age = state.age;

            // Name prompt
            if (!promptingName && !promptingAge) {
                // Prompt for Name
                state.promptingName = true;
                await namePrompt.prompt(context, 'Hello! What is your name?');
            } else if (promptingName) {
                // Attempt to recognize the user name
                name = await namePrompt.recognize(context);
                if (name === undefined) {
                    // Not recognized, re-prompt
                    await namePrompt.prompt(context, `Sorry, I didn't get that. What is your name?`);
                } else {
                    // Save name and set next state
                    state.name = name;
                    delete state.promptingName;
                }
            }

            // Age Prompt
            if (name !== undefined && age === undefined) {
                // Prompt for age
                if (!promptingAge) {
                    state.promptingAge = true;
                    await agePrompt.prompt(context, `How old are you, ${name}?`);
                } else {
                    age = await agePrompt.recognize(context);
                    if (age === undefined) {
                        // Not recognized, re-prompt
                        await namePrompt.prompt(context, `Sorry, that doesn't look right. Ages 13 to 90 only. What is your age?`);
                    } else {
                        // Save age and continue
                        state.age = age;
                        delete state.promptingAge;
                    }
                }
            }

            // Display provided information (if complete)
            if (name !== undefined && age !== undefined) {
                await context.sendActivity(`Hello ${name}. You are ${age}.`);

                // Reset sample by clearing state
                delete state.name;
                delete state.age;
            }
        }
    });
});