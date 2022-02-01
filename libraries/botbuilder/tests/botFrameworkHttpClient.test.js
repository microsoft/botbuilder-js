// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const nock = require('nock');
const { BotFrameworkHttpClient } = require('../');

const {
    AuthenticationConstants,
    ConversationConstants,
    GovernmentConstants,
    MicrosoftAppCredentials,
    SimpleCredentialProvider,
} = require('botframework-connector');

class TestBotFrameworkHttpClient extends BotFrameworkHttpClient {
    constructor(credentialProvider, channelService) {
        super(credentialProvider, channelService);
    }

    async buildCredentials() {
        return new MicrosoftAppCredentials('', '');
    }
}

class TestBotFrameworkHttpClientWithNoCredentials extends BotFrameworkHttpClient {
    constructor(credentialProvider, channelService) {
        super(credentialProvider, channelService);
    }

    async buildCredentials() {
        return null;
    }
}

describe('BotFrameworkHttpClient', function () {
    describe('constructor()', function () {
        it('should succeed with correct parameters', function () {
            new BotFrameworkHttpClient(new SimpleCredentialProvider('', ''));

            const client = new BotFrameworkHttpClient(new SimpleCredentialProvider('', ''), 'channels');
            assert.strictEqual(client.channelService, 'channels');
        });

        it('should read channelService from process.env if not provided in constructor', function () {
            try {
                process.env[AuthenticationConstants.ChannelService] = 'envChannelService';
                const client = new BotFrameworkHttpClient(new SimpleCredentialProvider('', ''));
                assert.strictEqual(client.channelService, 'envChannelService');
            } finally {
                delete process.env[AuthenticationConstants.ChannelService];
            }
        });

        it('should fail to construct without required parameters', function () {
            assert.throws(
                () => new BotFrameworkHttpClient(),
                new Error('BotFrameworkHttpClient(): missing credentialProvider')
            );
        });

        it('should succeed to make call', async function () {
            nock('http://skillUrl')
                .post('/api/good')
                .matchHeader(ConversationConstants.ConversationIdHttpHeaderName, 'conversationId')
                .reply(200, { id: 'some-id' });

            const credentialProvider = new SimpleCredentialProvider('', '');
            const client = new BotFrameworkHttpClient(credentialProvider, 'channels');
            const fromBotId = null;
            const response = await client.postActivity(
                fromBotId,
                'toBotId',
                'http://skillUrl/api/good',
                'serviceUrl',
                'conversationId',
                { type: 'message', conversation: {} }
            );
            assert.strictEqual(response.status, 200);
        });

        it('should return status code for a failed call', async function () {
            nock('http://skillUrl')
                .post('/api/bad')
                .matchHeader(ConversationConstants.ConversationIdHttpHeaderName, 'conversationId')
                .reply(404, { id: 'some-id' });

            const credentialProvider = new SimpleCredentialProvider('', '');
            const client = new BotFrameworkHttpClient(credentialProvider, 'channels');
            const fromBotId = null;
            const response = await client.postActivity(
                fromBotId,
                'toBotId',
                'http://skillUrl/api/bad',
                'serviceUrl',
                'conversationId',
                { type: 'message', conversation: {} }
            );
            assert.strictEqual(response.status, 404);
        });

        it('should succeed to make call using override buildCredentials', async function () {
            nock('http://skillUrl')
                .post('/api/good')
                .matchHeader(ConversationConstants.ConversationIdHttpHeaderName, 'conversationId')
                .reply(200, { id: 'some-id' });

            const credentialProvider = new SimpleCredentialProvider('this-is-not-the-app-id-your-looking-for', '1');
            const client = new TestBotFrameworkHttpClient(credentialProvider, 'channels');
            const fromBotId = 'this-is-not-the-app-id-your-looking-for';
            const response = await client.postActivity(
                fromBotId,
                'toBotId',
                'http://skillUrl/api/good',
                'serviceUrl',
                'conversationId',
                { type: 'message', conversation: {} }
            );
            assert.strictEqual(response.status, 200);
        });

        it('should fail to make call with wrong credentials', async function () {
            nock('http://skillUrl')
                .post('/api/good')
                .matchHeader(ConversationConstants.ConversationIdHttpHeaderName, 'conversationId')
                .reply(200, { id: 'some-id' });

            const credentialProvider = new SimpleCredentialProvider('test-app-id', 'test-app-Secret');
            const client = new TestBotFrameworkHttpClientWithNoCredentials(credentialProvider, 'channels');

            await assert.rejects(
                client.postActivity(
                    'fromBotId',
                    'toBotId',
                    'http://skillUrl/api/good',
                    'serviceUrl',
                    'conversationId',
                    { type: 'message', conversation: {} }
                ),
                new Error('BotFrameworkHttpClient.postActivity(): Unable to get appCredentials to connect to the skill')
            );
        });

        it('should fail to make call when no activity is provided', async function () {
            nock('http://skillUrl')
                .post('/api/good', (body) => body.recipient)
                .matchHeader(ConversationConstants.ConversationIdHttpHeaderName, 'conversationId')
                .reply(200, { id: 'some-id' });

            const credentialProvider = new SimpleCredentialProvider('this-is-not-the-app-id-your-looking-for', '1');
            const client = new TestBotFrameworkHttpClient(credentialProvider, 'channels');
            const fromBotId = 'this-is-not-the-app-id-your-looking-for';

            await assert.rejects(
                client.postActivity(fromBotId, 'toBotId', 'http://skillUrl/api/good', 'serviceUrl', 'conversationId'),
                new Error('BotFrameworkHttpClient.postActivity(): missing activity')
            );
        });

        it('should fail to make call when activity.conversation is undefined', async function () {
            nock('http://skillUrl')
                .post('/api/good', (body) => body.recipient)
                .matchHeader(ConversationConstants.ConversationIdHttpHeaderName, 'conversationId')
                .reply(200, { id: 'some-id' });

            const credentialProvider = new SimpleCredentialProvider('this-is-not-the-app-id-your-looking-for', '1');
            const client = new TestBotFrameworkHttpClient(credentialProvider, 'channels');
            const fromBotId = 'this-is-not-the-app-id-your-looking-for';
            const activity = { type: 'message' };

            await assert.rejects(
                client.postActivity(
                    fromBotId,
                    'toBotId',
                    'http://skillUrl/api/good',
                    'serviceUrl',
                    'conversationId',
                    activity
                ),
                new Error('BotFrameworkHttpClient.postActivity(): Activity must have a ConversationReference')
            );
        });

        it('should add empty recipient if missing from activity', async function () {
            nock('http://skillUrl')
                .post('/api/good', (body) => body.recipient)
                .matchHeader(ConversationConstants.ConversationIdHttpHeaderName, 'conversationId')
                .reply(200, { id: 'some-id' });

            const credentialProvider = new SimpleCredentialProvider('this-is-not-the-app-id-your-looking-for', '1');
            const client = new TestBotFrameworkHttpClient(credentialProvider, 'channels');
            const fromBotId = 'this-is-not-the-app-id-your-looking-for';
            const activity = { type: 'message', conversation: {} };
            const response = await client.postActivity(
                fromBotId,
                'toBotId',
                'http://skillUrl/api/good',
                'serviceUrl',
                'conversationId',
                activity
            );
            assert.strictEqual(response.status, 200);
            assert.strictEqual(activity.recipient, undefined);
        });

        it("should restore sent activity's relatesTo to original value", async function () {
            nock('http://skillUrl')
                .post('/api/good')
                .matchHeader(ConversationConstants.ConversationIdHttpHeaderName, 'conversationId')
                .reply(200, { id: 'some-id' });

            const credentialProvider = new SimpleCredentialProvider('', '');
            const client = new BotFrameworkHttpClient(credentialProvider, 'channels');
            const fromBotId = null;
            const originalRelatesTo = { serviceUrl: 'https://channel-service-url' };
            const forwardedActivity = { type: 'message', conversation: {}, relatesTo: originalRelatesTo };
            await client.postActivity(
                fromBotId,
                'toBotId',
                'http://skillUrl/api/good',
                'serviceUrl',
                'conversationId',
                forwardedActivity
            );
            assert.strictEqual(forwardedActivity.relatesTo, originalRelatesTo);
        });
    });

    describe('BuildCredentials', function () {
        it('should return credentials when channel service is goverment', async function () {
            const credentialProvider = new SimpleCredentialProvider('', '');
            const client = new BotFrameworkHttpClient(credentialProvider, 'https://botframework.azure.us');
            const credentials = await client.buildCredentials('test-app-id', 'test-scope');
            assert.strictEqual(credentials.oAuthEndpoint, GovernmentConstants.ToChannelFromBotLoginUrl);
        });

        it('should return credentials when channel service different than goverment', async function () {
            const credentialProvider = new SimpleCredentialProvider('', '');
            const client = new BotFrameworkHttpClient(credentialProvider, 'channels');
            const credentials = await client.buildCredentials('test-app-id', 'test-scope');
            assert.strictEqual(credentials.oAuthEndpoint, AuthenticationConstants.ToChannelFromBotLoginUrl);
        });
    });
});
