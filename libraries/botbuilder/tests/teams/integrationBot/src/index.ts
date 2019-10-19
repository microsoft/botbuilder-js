// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { config } from 'dotenv';
import * as path from 'path';
import * as restify from 'restify';

// Import required bot services. See https://aka.ms/bot-services to learn more about the different parts of a bot.
import { BotFrameworkAdapter, MemoryStorage, UserState } from 'botbuilder';

import { IntegrationBot } from './integrationBot';

// Import middleware for filtering messages based on Teams Tenant Id
import { TeamsTenantFilteringMiddleware  } from './teamsTenantFilteringMiddleware';

// Set up Nock
import * as nockHelper from './../src/nock-helper/nock-helper';
import { ActivityLog } from './activityLog';
nockHelper.nockHttp('integrationBot')


// Note: Ensure you have a .env file and include MicrosoftAppId and MicrosoftAppPassword.
const ENV_FILE = path.join(__dirname, '..', '.env');
config({ path: ENV_FILE });

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Use the TeamsTenantFilteringMiddleware IF there is an AllowedTeamsTenantId
if(process.env.AllowedTeamsTenantId){
    let teamsTenantFilteringMiddleware = new TeamsTenantFilteringMiddleware(process.env.AllowedTeamsTenantId);
    adapter.use(teamsTenantFilteringMiddleware);
}

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error('[onTurnError]:');
    console.error(error);
    // Send a message to the user
    await context.sendActivity(`Oops. Something went wrong in the bot!\n  ${error.message}`);
};

const activityIds: string[] = [];

// Define a state store for your bot. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state store to persist the dialog and user state between messages.

// For local development, in-memory storage is used.
// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone.
const memoryStorage = new MemoryStorage();
const userState = new UserState(memoryStorage);
const activityLog = new ActivityLog(memoryStorage);

// Create the bot.
const myBot = new IntegrationBot(userState, activityIds, activityLog);

if (nockHelper.isRecording()) {
    // Create HTTP server.
    const server = restify.createServer();
    
    server.get('/*', restify.plugins.serveStatic({
        directory: path.join(__dirname, '../static'),
        appendRequestPath: false
    }));

    server.listen(process.env.port || process.env.PORT || 3978, () => {
        console.log(`\n${ server.name } listening to ${ server.url }`);
        console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    });

    // Listen for incoming requests.
    server.post('/api/messages', (req, res) => {
        adapter.processActivity(req, res, async (context) => {
            if (req.body.text == 'exit') {
                //graceful shutdown
                process.exit();
            }
            nockHelper.logRequest(req, 'integrationBot');

            // Route to bot
            await myBot.run(context);
        });
    });
}
else if (nockHelper.isPlaying()) {
    nockHelper.processRecordings('integrationBot', adapter, myBot);
}
else if (nockHelper.isProxyHost()) {
    // Create HTTP proxy server.
    nockHelper.proxyRecordings();
}
else if (nockHelper.isProxyPlay()) {
    nockHelper.proxyPlay(myBot);
}
