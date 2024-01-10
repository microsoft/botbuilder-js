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
    type: 'apiKey',
    in: 'header',
    name: 'Authorization',
    value: 'BotConnector ' + directLineSecret,
};

async function getDirectLineClient() {
    const client = await Swagger({
        spec: directLineSpec,
        usePromise: true,
        requestInterceptor: (req) => {
            if (auths && auths.in === 'header') {
                req.headers[auths.name] = auths.value;
            }
            return req;
        },
    });

    return client;
}

async function sendMessage(client, conversationId) {
    let status;
    do {
        return client.apis.Conversations.Conversations_PostMessage({
            conversationId: conversationId,
            message: {
                from: directLineClientName,
                text: userMessage,
            },
        })
            .then((result) => {
                status = result.status;
            })
            .catch((err) => {
                status = err.status;
            });
    } while (status == 502);
}

function getMessages(client, conversationId) {
    const watermark = null;
    return client.apis.Conversations.Conversations_GetMessages({
        conversationId: conversationId,
        watermark: watermark,
    }).then((response) => {
        return response.obj.messages.filter((message) => message.from !== directLineClientName);
    });
}

async function getConversationId(client) {
    return client.apis.Conversations.Conversations_NewConversation().then((response) => response.obj.conversationId);
}

describe('Test Azure Bot', function () {
    this.timeout(60000);
    it('Check deployed bot answer', async function () {
        const directLineClient = await getDirectLineClient();
        const conversationId = await getConversationId(directLineClient);
        await sendMessage(directLineClient, conversationId);
        const messages = await getMessages(directLineClient, conversationId);
        const result = messages.filter((message) => message.text.includes('you said'));
        assert(result[0].text == `you said "${userMessage}" 0`, 'test fail');
    });
});
