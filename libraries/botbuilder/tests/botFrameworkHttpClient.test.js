const { strictEqual } = require('assert');
const { BotFrameworkHttpClient } = require('../');
const { AuthenticationConstants, SimpleCredentialProvider, MicrosoftAppCredentials } = require('botframework-connector');
const nock = require('nock');

class TestBotFrameworkHttpClient extends BotFrameworkHttpClient {
    constructor(credentialProvider, channelService) {
        super(credentialProvider, channelService);
    }
    async buildCredentials() {
        return new MicrosoftAppCredentials('', '');
    }
}

describe('BotFrameworkHttpClient', function() {
    this.timeout(3000);
    describe('constructor()', () => {
        it('should succeed with correct parameters', () => {
            new BotFrameworkHttpClient(new SimpleCredentialProvider('', ''));
    
            const client = new BotFrameworkHttpClient(new SimpleCredentialProvider('', ''), 'channels');
            strictEqual(client.channelService, 'channels');
        });
    
        it('should read channelService from process.env if not provided in constructor', () => {
            try {
                process.env[AuthenticationConstants.ChannelService] = 'envChannelService';
                const client = new BotFrameworkHttpClient(new SimpleCredentialProvider('', ''));
                strictEqual(client.channelService, 'envChannelService');
            } finally {
                process.env[AuthenticationConstants.ChannelService] = undefined;
            }
        });
        
        it('should fail to construct without required parameters', () => {
            try {
                new BotFrameworkHttpClient();
            } catch (e) {
                strictEqual(e.message, 'BotFrameworkHttpClient(): missing credentialProvider');
            }
        });

        it('should succeed to make call', async () => {

            nock('http://skillUrl')
                .post('/api/good')
                .reply(200, { id: 'some-id' });
        
            const credentialProvider = new SimpleCredentialProvider('', '');
            const client = new BotFrameworkHttpClient(credentialProvider, 'channels');
            const fromBotId = null;
            const response = await client.postActivity(fromBotId, 'toBotId', 'http://skillUrl/api/good', 'serviceUrl', 'conversationId', { type: 'message', conversation: { } });
            strictEqual(response.status, 200);
        });

        it('should return status code for a failed call', async () => {

            nock('http://skillUrl')
                .post('/api/bad')
                .reply(404, { id: 'some-id' });

            const credentialProvider = new SimpleCredentialProvider('', '');
            const client = new BotFrameworkHttpClient(credentialProvider, 'channels');
            const fromBotId = null;
            const response = await client.postActivity(fromBotId, 'toBotId', 'http://skillUrl/api/bad', 'serviceUrl', 'conversationId', { type: 'message', conversation: { } });
            strictEqual(response.status, 404);
        });

        it('should succeed to make call using override buildCredentials', async () => {

            nock('http://skillUrl')
                .post('/api/good')
                .reply(200, { id: 'some-id' });
        
            const credentialProvider = new SimpleCredentialProvider('this-is-not-the-app-id-your-looking-for', '1');
            const client = new TestBotFrameworkHttpClient(credentialProvider, 'channels');
            const fromBotId = 'this-is-not-the-app-id-your-looking-for';
            const response = await client.postActivity(fromBotId, 'toBotId', 'http://skillUrl/api/good', 'serviceUrl', 'conversationId', { type: 'message', conversation: { } });
            strictEqual(response.status, 200);
        });
    });
});
