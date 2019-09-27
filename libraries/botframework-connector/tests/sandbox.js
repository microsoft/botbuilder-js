const BotConnector = require('../lib');
const CustomConnectorClient = require('../lib/customConnectorApi').CustomConnectorClient;
const CustomCredentials = require('../lib/auth').CustomMicrosoftAppCredentials;
const Assert = require('assert');
var fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });


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

const testGetConversations = async function(client, newClient, token, params, options){
    const optionsGetConversations = {
        continuationToken: undefined,
        customHeaders: {
            'Authorization': `Bearer ${ token }`
        },
        headers: {
            'Authorization': `Bearer ${ token }`
        }
    };
    const expected = await client.conversations.createConversation(params, options).then(() => {
        return client.conversations.getConversations(optionsGetConversations).then((result) => {
            return result;
        });
    });

    const actual = await newClient.conversations.createConversation(params, options).then(() => {
        return newClient.conversations.getConversations(optionsGetConversations).then((result) => {
            return result;
        });
    });
    
    console.log('Testing -- getConversations');
    console.log(' Expected output: ');
    console.log(expected);
    console.log('\n Actual output: ');
    console.log(actual);
};

const testGetConversationsMembers = async function(client, newClient, params, options) {

    await newClient.conversations.createConversation(params, options).then( async (result) => {
        const conversationId = result.id;
        const expected = await client.conversations.getConversationMembers(conversationId, options);
        const actual = await newClient.conversations.getConversationMembers(conversationId, options);

        console.log('Testing -- getConversationsMembers');
        console.log(' Expected output: ');
        console.log(expected);
        console.log('\n Actual output: ');
        console.log(actual);    });
};

const testUploadAttachmentAndGetAttachmentInfo = async function(client, newClient, params, options) {
    await newClient.conversations.createConversation(params, options).then((result) => {
        const conversationId = result.id;
        newClient.conversations.uploadAttachment(conversationId, createAttachment(), options).then( async (result) => {
            const attachmentId = result.id;
            const expected = await client.attachments.getAttachmentInfo(attachmentId, options);
            const actual = await newClient.attachments.getAttachmentInfo(attachmentId, options);
            console.log('Testing -- uploadattAchment and getattachmentInfo');
            console.log(' Expected output: ');
            console.log(expected);
            console.log('\n Actual output: ');
            console.log(actual);
        }).catch(err => console.log(`Error at testUploadAttachmentAndGetAttachmentInfo: ${ err }`));
    });
};

(async () => {
    // AppId, Password, Client (telegram, slack, msteams, etc) to test
    const appId ='952fc53e-ef44-4230-982f-18ea6187efa3';
    const appPassword = 'WCnmUqmLVvfK+51sMq7Oqq0j?QxiPM]:';
    const basePath = process.env.HOST_URL;
    
    const newCredentials = new CustomCredentials(appId, appPassword);
    // Create client with new implementation
    const newClient = new CustomConnectorClient(newCredentials, {baseUri:basePath});

    // Create client with old implementation
    const credentials = new BotConnector.MicrosoftAppCredentials(appId, appPassword);
    const client = new BotConnector.ConnectorClient(credentials, {
        baseUri: basePath,
        withCredentials: true
    });

    const gasper = {
        id :'8465c57d-0c38-484f-9cc9-0120cd270023'
    };
    const mik = {
        id: '4070e730-90b9-473e-bded-6e04e08a8864'
    }
    // Parameters used by the method
    const params = {
        bot: {
            id: '2a5c3a66-b0e6-4688-b00e-af14a87de499'
        },
        members: [gasper]
    };

    try {
        // token creation to avoid issues with headers
        const token = await newCredentials.getToken(true);
        const options = {
            customHeaders: {
                'Authorization': `Bearer ${ token }`
            },
            headers: {
                'Authorization': `Bearer ${ token }`
            }
        };

        const conv = await newClient.conversations.createConversation(params, options);
        const members = await newClient.conversations.getConversationMembers(conv.id, options);
        console.log(members);

    } catch (error) {
        console.error(error);
    }
})();


