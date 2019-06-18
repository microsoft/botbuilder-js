/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const assert = require('assert');
const directLineSpec = require('./directline-swagger.json');
const Swagger = require('swagger-client');

const directLineClientName = 'DirectLineClient';
const userMessage = 'Contoso';
const directLineSecret = process.env.DIRECT_LINE_KEY || null;

const auths = {
    AuthorizationBotConnector: new Swagger.ApiKeyAuthorization('Authorization', 'BotConnector ' + directLineSecret, 'header'),
};

function getDirectLineClient() {    
    return new Swagger({
        spec: directLineSpec,
        usePromise: true,
        authorizations: auths
    });
}

async function sendMessage(client, conversationId) {       
    let status;
    do{
        await client.Conversations.Conversations_PostMessage({
            conversationId: conversationId,
            message: {
                from: directLineClientName,
                text: userMessage
            }
        }).then((result) => {
            status = result.status;
        }).catch((err)=>{
            status = err.status;
        }); 
    }while(status == 502);
}

function getMessages(client, conversationId) {    
    let watermark = null;
    return client.Conversations.Conversations_GetMessages({ conversationId: conversationId, watermark: watermark })
        .then((response) => {            
            return response.obj.messages.filter((message) => message.from !== directLineClientName);       
        });
}

function getConversationId(client) {
    return client.Conversations.Conversations_NewConversation()
        .then((response) => response.obj.conversationId);
}

describe('Test Azure Bot', function(){
    this.timeout(60000);    
    it('Check deployed bot answer', async function(){
        const directLineClient = await getDirectLineClient();    
        const conversationId = await getConversationId(directLineClient);
        await sendMessage(directLineClient, conversationId);
        const messages = await getMessages(directLineClient, conversationId);
        const result = messages.filter((message) => message.text.includes('you said'));                
        assert(result[0].text == `you said "${ userMessage }" 0`, `test fail`);
    });
});
