const { strictEqual } = require('assert');
const { BotFrameworkHttpClient } = require('../');
const { AuthenticationConstants, SimpleCredentialProvider } = require('botframework-connector');

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
    });
});
