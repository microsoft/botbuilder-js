// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { BotFrameworkAdapter, BotStateSet, ConversationState, MemoryStorage, UserState } = require('botbuilder');
const { createOAuthPrompt } = require('botbuilder-prompts');
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

// Set the OAuth Connection Setting name to use
const connectionName = process.env.CONNECTION_NAME;

// Add state middleware
const storage = new MemoryStorage();
const convoState = new ConversationState(storage);
const userState = new UserState(storage);
adapter.use(new BotStateSet(convoState, userState));

// Create our oauthPrompt
const oauthPrompt = createOAuthPrompt({
    text: 'Please sign in',
    title: 'Sign in',
    connectionName: connectionName,
});

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        const state = convoState.get(context);
        
        // Use this command to have the emulator send mocked tokens to the bot rather than authenticating
        // adapter.emulateOAuthCards(context, true);

        if (context.activity.type === 'conversationUpdate' && context.activity.membersAdded[0].name !== 'Bot') {
            // Sign the user in using an OAuthCard
            state.prompt = 'oauth';
            await oauthPrompt.prompt(context);
        } else if (context.activity.type === 'message') {
            // If the user is in an OAuthPrompt, continue it
            if (state.prompt === 'oauth') {
                const value = await oauthPrompt.recognize(context);
                await context.sendActivity("Your token is: " + value.token);
                state.prompt = undefined;
            } else {
                if (context.activity.text === 'signout') {
                    // Sign the user out
                    await oauthPrompt.signOutUser(context);
                    await context.sendActivity("You are now signed out.");
                } else {
                    // See if the user is already logged in
                    const value = await oauthPrompt.getUserToken(context);
                    if (value) {
                        await context.sendActivity("You are already signed in with token: " + value.token);
                    } else {
                        // sign the user in
                        state.prompt = 'oauth';
                        await oauthPrompt.prompt(context);
                    }
                }
            }
        } else if (context.activity.type === 'event') {
            // If the user is in an OAuthPrompt, continue it because this is likely the TokenResponse event
            if (state.prompt === 'oauth') {
                const value = await oauthPrompt.recognize(context);
                await context.sendActivity("Your token is: " + value.token);
                state.prompt = undefined;
            }
        }
    });
});