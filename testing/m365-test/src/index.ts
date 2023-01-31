// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Import required packages
import { config } from 'dotenv';
import * as path from 'path';
import * as restify from 'restify';

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
import {
    CloudAdapter,
    ConfigurationBotFrameworkAuthentication,
    ConfigurationBotFrameworkAuthenticationOptions,
    MemoryStorage
} from 'botbuilder';

// Read botFilePath and botFileSecret from .env file.
const ENV_FILE = path.join(__dirname, '..', '.env');
config({ path: ENV_FILE });

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(process.env as ConfigurationBotFrameworkAuthenticationOptions);

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about how bots work.
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Create storage to use
//const storage = new MemoryStorage();

// Catch-all for errors.
const onTurnErrorHandler = async ( context, error ) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error( `\n [onTurnError] unhandled error: ${ error }` );

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity( 'The bot encountered an error or bug.' );
    await context.sendActivity( 'To continue to run this bot, please fix the bot source code.' );
};

// Set the onTurnError for the singleton CloudAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Create HTTP server.
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log( `\n${ server.name } listening to ${ server.url }` );
    console.log( '\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator' );
    console.log( '\nTo talk to your bot, open the emulator select "Open Bot"' );
});

import { Application, DefaultTurnState, OpenAIPredictionEngine } from 'botbuilder-m365';

interface ConversationState {
    lightsOn: boolean;
}
type ApplicationTurnState = DefaultTurnState<ConversationState>;

// Create prediction engine
const predictionEngine = new OpenAIPredictionEngine({
    configuration: {
        apiKey: process.env.OPENAI_API_KEY
    },
    prompt: path.join(__dirname, '../src/prompt.txt'),
    promptConfig: {
        model: "text-davinci-003",
        temperature: 0.2,
        max_tokens: 150,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stop: [" Human:", " AI:"],
    }
});

// Define storage and application
const storage = new MemoryStorage();
const app = new Application<ApplicationTurnState>({
    storage,
    predictionEngine
});

app.message('reset', async (context, state) => {
    state.conversation.delete();
    await context.sendActivity(`Ok... starting over`);
});

app.action('LightsOn', async (context, state, data) => {
    state.conversation.value.lightsOn = true;
    await context.sendActivity(`[lights on]`);
});

app.action('LightsOff', async (context, state, data) => {
    state.conversation.value.lightsOn = false;
    await context.sendActivity(`[lights off]`);
});

app.action('Pause', async (context, state, data) => {
    const time = data.time ? parseInt(data.time) : 1000;
    await context.sendActivity(`[pausing for ${time / 1000} seconds]`);
    await new Promise((resolve) => setTimeout(resolve, time));
});

// Listen for incoming server requests.
server.post('/api/messages', async (req, res) => {
    // Route received a request to adapter for processing
    await adapter.process(req, res as any, async (context) => {
        // Dispatch to application for routing
        await app.run(context);
    });
});

/*
// Listen for ANY message to be received.
app.activity(ActivityTypes.Message, async (context, state) => {
    // Increment count state
    let count = state.conversation.value.count ?? 0;
    state.conversation.value.count = ++count;

    // Echo back users request
    await context.sendActivity(`[${count}] you said: ${context.activity.text}`);
});

// Listen for user to say "reset"
app.message(`reset`, async (context, state) => {
    state.conversation.value.count = 0;
    await context.sendActivity(`Counter has been reset`);
});

// Listen for search actions
app.messageExtensions.query('searchCmd', async (context, state, query) => {
    // Find query results
    const keyword = query.parameters['searchKeyword'] ?? '';
    const results: MessagingExtensionAttachment[] = [];
    for (let i = 0; i < 5; i++) {
        const item = { 
            id: i + 1, 
            title: `Result ${i + 1}`,
            keyword: keyword
        };
        const card = CardFactory.heroCard(item.title, [], [], { 
            text: item.keyword 
        }) as MessagingExtensionAttachment;
        card.preview = CardFactory.heroCard(item.title, [], [], {
            text: item.keyword,
            tap: { type: 'invoke', value: item } as CardAction
        });
        results.push(card);
    }

    // Return results
    return {
        type: 'result',
        attachmentLayout: 'list',
        attachments: results
    };
});

// Listen for item tap
app.messageExtensions.selectItem(async (context, state, item) => {
    // Generate detailed result
    const details = CardFactory.heroCard(item.title, [], [], { 
        text: item.keyword 
    });

    // Return results
    return {
        type: 'result',
        attachmentLayout: 'list',
        attachments: [details]
    };
});
*/
