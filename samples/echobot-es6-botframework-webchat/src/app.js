// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import './css/app.css';
import { BotStateSet, ConversationState, MemoryStorage, UserState } from 'botbuilder';
import { BlobStorage, CosmosDbStorage } from 'botbuilder-azure';
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

// Create the custom WebChatAdapter and add the ConversationState middleware
const webChatAdapter = new WebChatAdapter()

// Connect our BotFramework-WebChat App instance with the DOM
App({
    user: { id: "Me!" },
    bot: { id: "bot" },
    botConnection: webChatAdapter.botConnection,
}, document.getElementById('bot'));

// Add the instatiated storage into state middleware
const convoState = new ConversationState(memory);
const userState = new UserState(memory);
webChatAdapter.use(new BotStateSet(convoState, userState));

// Register the business logic of the bot through the WebChatAdapter's processActivity implementation.
webChatAdapter.processActivity(async (context) => {
    const state = convoState.get(context);
    state.bump = state.bump ? state.bump + 1 : 1;
    await context.sendActivity(`${state.bump}: You said, "${context.activity.text}"`);
});

// FOUC
document.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(() => document.body.style.visibility = 'visible');
});