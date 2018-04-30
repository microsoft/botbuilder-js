import './css/app.css';
import { Bot, ConversationState, MemoryStorage } from 'botbuilder';
import { BlobStorage, CosmosDbStorage, TableStorage } from 'botbuilder-azure';
import 'botframework-webchat/botchat.css';
import { App } from 'botframework-webchat/built/App';
import { WebChatAdapter } from './webChatAdapter';

// Instantiate MemoryStorage for use with the ConversationState middleware
// Below are examples of different memory storage offerings that use Azure Blob, Table and Cosmos DB storage
const memory = new MemoryStorage();

// To use Azure Blob Storage to store memory, you can the BlobStorage class from `botbuilder-azure`
// When using BlobStorage either a host string or a `Host` interface must be provided for the host parameter, https://github.com/Microsoft/botbuilder-js/blob/master/libraries/botbuilder-azure/src/blobStorage.ts#L13L29
// const blobStorageHost = {
//     primaryHost: '',
//     secondaryHost: ''
// }
// const memory = new BlobStorage({
//     storageAccountOrConnectionString: '',
//     storageAccessKey: '',
//     host: '' || blobStorageHost,
//     containerName: ''
// });

// To use Azure Cosmos DB Storage to store memory, you can the CosmosDbStorage class from `botbuilder-azure`
// const memory = new CosmosDbStorage({
//     serviceEndpoint: '',
//     authKey: '',
//     databaseId: '',
//     collectionId: ''
// });

// To use Azure Table Storage to store memory, you can the TableStorage class from `botbuilder-azure`
// const memory = new TableStorage({
//     tablename: '',                                                                             
//     storageAccessKey: '', // optional
//     storageAccountOrConnectionString: '', // optional
//     host: '' // optional
// });

// Add the instatiated storage into a new ConversationState
const conversationState = new ConversationState(memory);

// Create the custom WebChatAdapter and add the ConversationState middleware
const webChatAdapter = new WebChatAdapter()
    .use(conversationState)

// Connect our BotFramework-WebChat App instance with the DOM
App({
    user: { id: "Me!" },
    bot: { id: "bot" },
    botConnection: webChatAdapter.botConnection,
}, document.getElementById('bot'));

// Register the business logic of the bot through the WebChatAdapter's processActivity implementation.
webChatAdapter.processActivity(async (context) => {
    const state = conversationState.get(context);
    state.bump = state.bump ? state.bump + 1 : 1;
    await context.sendActivity(`${state.bump}: You said, "${context.activity.text}"`);
});

// FOUC
document.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(() => document.body.style.visibility = 'visible');
});