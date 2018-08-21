// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const path = require('path');
const env = require('dotenv').config({path: path.join(__dirname,'.env')});
const restify = require('restify');

const { BotFrameworkAdapter, MemoryStorage, ConversationState } = require('botbuilder');
const { BotConfiguration } = require('botframework-config');

const MainDialog = require('./dialogs/mainDialog/main');
const BOT_CONFIGURATION = 'echobot-with-counter';

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet emulator: https://aka.ms/botframework-emulator`);
    // TODO: Add emulator deep link
    console.log(`\nTo talk to your bot, open the EchoBot-With-Counter.bot file in the Emulator`);
});

// read bot configuration from .bot file.
// See https://aka.ms/about-bot-file to learn more about bot file its use.
let botConfig = BotConfiguration.loadSync(path.join(__dirname, process.env.botFilePath), process.env.botSecret);
 
// Get bot endpoint configuration by service name
const endpointConfig = botConfig.findServiceByNameOrId(BOT_CONFIGURATION);

// Create adapter
const adapter = new BotFrameworkAdapter({
    appId: endpointConfig.appId || process.env.microsoftAppID,
    appPassword: endpointConfig.appPassword || process.env.microsoftAppPassword
});

// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone. 
const memoryStorage = new MemoryStorage();
// For production bots use the Azure CosmosDB storage, Azure Blob, or Azure Table storage provides. 
// const { CosmosDbStorage } = require('botbuilder-azure');
// const STORAGE_CONFIGURATION = 'cosmosDB'; // this is the name of the cosmos DB configuration in your .bot file
// const cosmosConfig = botConfig.findServiceByNameOrId(STORAGE_CONFIGURATION);
// const cosmosStorage = new CosmosDbStorage({serviceEndpoint: cosmosConfig.connectionString, 
//                                            authKey: ?, 
//                                            databaseId: cosmosConfig.database, 
//                                            collectionId: cosmosConfig.collection});

// create conversation state with in-memory storage provider.
const convoState = new ConversationState(memoryStorage);

// add state middleware.
adapter.use(convoState);

// Create main dialog.
const mainDlg = new MainDialog(convoState);

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, async (context) => {
        // route to main dialog.
        await mainDlg.onTurn(context);        
    });
});

