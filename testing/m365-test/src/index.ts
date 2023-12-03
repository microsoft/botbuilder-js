// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Import required packages
import { config } from 'dotenv';
import * as path from 'path';
import * as restify from 'restify';

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
import {
    ActivityTypes,
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

import { AI, Application, ConversationHistoryTracker, DefaultTurnState, OpenAIPredictionEngine } from 'botbuilder-m365';

interface ConversationState {
    lightsOn: boolean;
    count: number;
}
type ApplicationTurnState = DefaultTurnState<ConversationState>;

// Create prediction engine
const predictionEngine = new OpenAIPredictionEngine({
    configuration: {
        apiKey: process.env.OPENAI_API_KEY
    },
    prompt: path.join(__dirname, '../src/lightPrompt.txt'),
    promptConfig: {
        model: "text-davinci-003",
        temperature: 0.0,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stop: [" Human:", " AI:"],
    },
    // topicFilter: path.join(__dirname, '../src/lightTopicFilter.txt'),
    // topicFilterConfig: {
    //     model: "text-davinci-003",
    //     temperature: 0.0,
    //     max_tokens: 2048,
    //     top_p: 1,
    //     frequency_penalty: 0,
    //     presence_penalty: 0.6,
    //     stop: [" Human:", " AI:"],
    // },
});

// Define storage and application
const storage = new MemoryStorage();
const app = new Application<ApplicationTurnState>({
    storage,
    predictionEngine
});

app.message("/history", async (context, state) => {
    state.conversation.value[ConversationHistoryTracker.StatePropertyName];

    const history = ConversationHistoryTracker.getHistoryAsText(context, state);
    await context.sendActivity(history)
});

app.ai.action(AI.UnknownActionName, async (context, state, data, action) => {
    await context.sendActivity(`I don't know how to do '${action}'.`);
    return false;
});

app.ai.action(AI.OffTopicActionName, async (context, state) => {
    await context.sendActivity(`I'm sorry, I'm not allowed to talk about such things...`);
    return false;
});

app.ai.action('LightsOn', async (context, state) => {
    state.conversation.value.lightsOn = true;
    await context.sendActivity(`[lights on]`);
    return true;    
});

app.ai.action('LightsOff', async (context, state) => {
    state.conversation.value.lightsOn = false;
    await context.sendActivity(`[lights off]`);
    return true;
});

app.ai.action('Pause', async (context, state, data) => {
    const time = data.time ? parseInt(data.time) : 1000;
    await context.sendActivity(`[pausing for ${time / 1000} seconds]`);
    await new Promise((resolve) => setTimeout(resolve, time));
    return true;
});

app.ai.action('LightStatus', async (context, state) => {
    // Create data to pass into prompt
    const data = {
        lightStatus: state.conversation.value.lightsOn ? 'on' : 'off'
    };

    // Chain into a new prompt
    await app.ai.chain(
        context, 
        state, 
        data, 
        {
            prompt: path.join(__dirname, '../src/lightStatus.txt'),
            promptConfig: {
                model: "text-davinci-003",
                temperature: 0.7,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            }
        });

    // End the previous chain
    return false;
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

app.ai.action('LightsOn', async (context, state) => {
    state.conversation.value.lightsOn = true;
    await context.sendActivity(`[lights on]`);
    return true;    
});

app.ai.action('LightsOff', async (context, state) => {
    state.conversation.value.lightsOn = false;
    await context.sendActivity(`[lights off]`);
    return true;
});

app.ai.action('Pause', async (context, state, data) => {
    const time = data.time ? parseInt(data.time) : 1000;
    await context.sendActivity(`[pausing for ${time / 1000} seconds]`);
    await new Promise((resolve) => setTimeout(resolve, time));
    return true;
});

app.ai.action('LightStatus', async (context, state) => {
    // Create data to pass into prompt
    const data = {
        lightStatus: state.conversation.value.lightsOn ? 'on' : 'off'
    };

    // Chain into a new prompt
    await app.ai.chain(
        context, 
        state, 
        data, 
        {
            prompt: path.join(__dirname, '../src/lightStatus.txt'),
            promptConfig: {
                model: "text-davinci-003",
                temperature: 0.7,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            }
        });

    // End the previous chain
    return false;
});

app.message("/state", async (context, state) => {
    await context.sendActivity(JSON.stringify(state.conversation.value));
});

app.message("/history", async (context, state) => {
    const history = ConversationHistoryTracker.getHistoryAsText(context, state);
    await context.sendActivity(history)
});

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
