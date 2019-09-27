const BotConnector = require('../lib');
const CustomConnectorClient = require('../lib/customConnectorApi').CustomConnectorClient;
const CustomCredentials = require('../lib/auth').CustomMicrosoftAppCredentials;
const Assert = require('assert');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

var fs = require('fs');

var createAttachment = () => ({
    name: 'bot-framework.png',
    type: 'image/png',
    originalBase64: base64Encode(__dirname + '/bot-framework.png')
});

function base64Encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return Buffer.from(bitmap);
}

(async () => {
    // AppId, Password, Client (telegram, slack, msteams, etc) to test
    const appId = process.env.CLIENT_ID;
    const appPassword = process.env.CLIENT_SECRET;
    const basePath = process.env.HOST_URL;
    
    const newCredentials = new CustomCredentials(appId, appPassword)
    // Create client with new implementation
    const newClient = new CustomConnectorClient(newCredentials, {baseUri:basePath});

    // Create client with old implementation
    const credentials = new BotConnector.MicrosoftAppCredentials(appId, appPassword);
    const client = new BotConnector.ConnectorClient(credentials, {
        baseUri: basePath,
        withCredentials: true
    });

    // params used by the method
    const params = {
        bot: {
            id: process.env.BOT_ID
        },
        members: [
            {
                id: process.env.USER_ID
            }
        ]
    };

    try {
        // token creation to avoid issues with headers
        const token = await credentials.getToken(true);
        const options = {
            customHeaders: {
                'Authorization': `Bearer ${token}`
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        testUploadAttachmentAndGetAttachmentInfo(client, newClient, params, options);

        testGetConversations(client, newClient, token, params, options);
        
        testGetConversationsMembers(client, newClient, params, options);
    } catch (error) {
        console.error(error);
    }
})();

const testGetConversations = async function(client, newClient, token, params, options){
    const optionsGetConversations = {
        continuationToken: undefined,
        customHeaders: {
            'Authorization': `Bearer ${token}`
        },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    const expected = await client.conversations.createConversation(params, options).then(() => {
        return client.conversations.getConversations(optionsGetConversations).then((result) => {
            return result;
        })
    });

    const actual = await newClient.conversations.createConversation(params, options).then(() => {
        return newClient.conversations.getConversations(optionsGetConversations).then((result) => {
            return result;
        })
    });
    
    Assert.deepStrictEqual(actual, expected, 'getConversations Failed.');
}

const testGetConversationsMembers = async function(client, newClient, params, options) {

    await newClient.conversations.createConversation(params, options).then(async(result) => {
        const conversationId = result.id;

        const expected = await client.conversations.getConversationMembers(conversationId, options);

        const actual = await newClient.conversations.getConversationMembers(conversationId, options);

        Assert.deepStrictEqual(actual, expected, 'getConversationMembers Failed.');
    });
}

const testUploadAttachmentAndGetAttachmentInfo = async function(client, newClient, params, options) {
    await newClient.conversations.createConversation(params, options).then((result) => {
        const conversationId = result.id;
        newClient.conversations.uploadAttachment(conversationId, createAttachment(), options).then(async(result) => {
            const attachmentId = result.id;

            const expected = await client.attachments.getAttachmentInfo(attachmentId, options);

            const actual = await newClient.attachments.getAttachmentInfo(attachmentId, options);

            Assert.deepStrictEqual(actual, expected, 'getAttachmentInfo Failed.');
        }).catch(err => console.log(`Error at testUploadAttachmentAndGetAttachmentInfo: ${ err }`))
    });
}
