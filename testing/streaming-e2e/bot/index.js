// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const path = require('path');
const dotenv = require('dotenv');
// Import required bot configuration.
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { CallerIdConstants, CloudAdapter } = require('botbuilder');

const {
    AuthenticationConstants,
    BotFrameworkAuthenticationFactory,
    PasswordServiceClientCredentialFactory,
} = require('botframework-connector');

const generateDirectLineToken = require('./utils/generateDirectLineToken');
const renewDirectLineToken = require('./utils/renewDirectLineToken');

// This bot's main dialog.
const { EchoBot } = require('./bot');
const restify = require('restify');

// Create HTTP server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

const appId = process.env.MicrosoftAppId || '';
const appPassword = process.env.MicrosoftAppPassword || '';

const botFrameworkAuthentication = BotFrameworkAuthenticationFactory.create(
    '',
    true,
    AuthenticationConstants.ToChannelFromBotLoginUrl,
    AuthenticationConstants.ToChannelFromBotOAuthScope,
    AuthenticationConstants.ToBotFromChannelTokenIssuer,
    AuthenticationConstants.OAuthUrl,
    AuthenticationConstants.ToBotFromChannelOpenIdMetadataUrl,
    AuthenticationConstants.ToBotFromEmulatorOpenIdMetadataUrl,
    CallerIdConstants.PublicAzureChannel,
    new PasswordServiceClientCredentialFactory(appId, appPassword)
);

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about how bots work.
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError] unhandled error: ${error}`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${error}`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Set the onTurnError for the singleton BotFrameworkAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Create the main dialog.
const myBot = new EchoBot();

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.process(req, res, (context) => myBot.run(context));
});

adapter.connectNamedPipe(
    `${process.env.APPSETTING_WEBSITE_SITE_NAME}.directline`,
    (context) => myBot.run(context),
    appId,
    AuthenticationConstants.ToChannelFromBotOAuthScope
);

// Listen for Upgrade requests for Streaming.
server.on('upgrade', async (req, socket, head) => {
    // Create an adapter scoped to this WebSocket connection to allow storing session data.
    const streamingAdapter = new CloudAdapter(botFrameworkAuthentication);

    // Set onTurnError for the BotFrameworkAdapter created for each connection.
    streamingAdapter.onTurnError = onTurnErrorHandler;

    await streamingAdapter.process(req, socket, head, (context) => myBot.run(context));
});

// Token Server, to ensure DL secret is not visible to client
server.post('/api/token/directlinease', async (req, res) => {
    const { DIRECT_LINE_SECRET, WEBSITE_HOSTNAME } = process.env;

    try {
        if (!WEBSITE_HOSTNAME) {
            return res.send(500, 'only available on azure', { 'Access-Control-Allow-Origin': '*' });
        }

        const { token } = req.query;

        try {
            const result = await (token
                ? renewDirectLineToken(token, { domain: `https://${WEBSITE_HOSTNAME}/.bot/` })
                : generateDirectLineToken(DIRECT_LINE_SECRET, { domain: `https://${WEBSITE_HOSTNAME}/.bot/` }));

            res.sendRaw(JSON.stringify(result, null, 2), {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            });
        } catch (err) {
            res.send(500, err.message);
        }

        if (token) {
            console.log(`Refreshing Direct Line ASE token`);
        } else {
            console.log(
                `Requesting Direct Line ASE token using secret "${DIRECT_LINE_SECRET.substr(
                    0,
                    3
                )}...${DIRECT_LINE_SECRET.substr(-3)}"`
            );
        }
    } catch (err) {
        res.send(500, { message: err.message, stack: err.stack }, { 'Access-Control-Allow-Origin': '*' });
    }
});
