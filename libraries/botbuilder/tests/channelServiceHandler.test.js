const { fail, ok: assert, strictEqual } = require('assert');
const { ActivityTypes, StatusCodes } = require('botbuilder-core');
const { AuthenticationConfiguration, AuthenticationConstants, ClaimsIdentity, JwtTokenValidation, SimpleCredentialProvider } = require('botframework-connector');
const { ChannelServiceHandler } = require('../');
const { isEmpty } = require('lodash');
const { stub } = require('sinon');

const AUTH_HEADER = 'Bearer HelloWorld';
const AUTH_CONFIG = new AuthenticationConfiguration();
const CREDENTIALS = new SimpleCredentialProvider('', '');
const ACTIVITY = { id: 'testId', type: ActivityTypes.Message }

class NoAuthHandler extends ChannelServiceHandler {
    async handleSendToConversation(authHeader, conversationId, activity) {
        assert(authHeader, 'authHeader not received');
        assert(conversationId, 'conversationId not received');
        assert(activity, 'activity not received');
        return await super.handleSendToConversation(authHeader, conversationId, activity);
    }

    // Override the private authenticate method to bypass auth.
    async authenticate(authHeader) {
        assert.strictEqual(authHeader, AUTH_HEADER);
        return new ClaimsIdentity([]);
    }
}

const createDefaultErrorMessage = (methodName) => {
    return `ChannelServiceHandler.${ methodName }(): 501: Not Implemented`;
};

describe('ChannelServiceHandler', () => {
    describe('constructor', () => {
        it('should succeed with valid parameters', () => {
            const channelService = 'channels';
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG, channelService);
    
            strictEqual(handler.authConfig, AUTH_CONFIG);
            strictEqual(handler.credentialProvider, CREDENTIALS);
            strictEqual(handler.channelService, channelService);
        });
    
        it('should use process.env.ChannelService if no channelService is provided', () => {
            process.env[AuthenticationConstants.ChannelService] = 'test';
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);
    
            strictEqual(handler.authConfig, AUTH_CONFIG);
            strictEqual(handler.credentialProvider, CREDENTIALS);
            strictEqual(handler.channelService, 'test');
            delete process.env[AuthenticationConstants.ChannelService];
        });
    
        it('should fail with invalid credentialProvider or authConfig', () => {
            try {
                const handler = new NoAuthHandler();
                fail('Should not have successfully constructed without credentialProvider');
            } catch (e) {
                strictEqual(e.message, 'BotFrameworkHttpClient(): missing credentialProvider');
            }
    
            try {
                const handler = new NoAuthHandler(CREDENTIALS);
                fail('Should not have successfully constructed without authConfig');
            } catch (e) {
                strictEqual(e.message, 'BotFrameworkHttpClient(): missing authConfig');
            }
    
        });
    });

    describe('SendToConversation flow:', () => {
        it('handleSendToConversation should call onSendToConversation', async () => {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);
            try {
                await handler.handleSendToConversation(AUTH_HEADER, 'convId', { type: ActivityTypes.Message });
            } catch (e) {
                strictEqual(e.message, createDefaultErrorMessage('onSendToConversation'));
            }
        });
    });

    describe('ReplyToActivity flow:', () => {
        it('handleReplyToActivity should call onReplyToActivity', async () => {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);
            try {
                await handler.handleReplyToActivity(AUTH_HEADER, 'convId', ACTIVITY.id, ACTIVITY);
            } catch (e) {
                strictEqual(e.message, createDefaultErrorMessage('onReplyToActivity'));
            }
        });
    });

    describe('UpdateActivity flow:', () => {
        it('handleUpdateActivity should call onUpdateActivity', async () => {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);
            try {
                await handler.handleUpdateActivity(AUTH_HEADER, 'convId', ACTIVITY.id, ACTIVITY);
            } catch (e) {
                strictEqual(e.message, createDefaultErrorMessage('onUpdateActivity'));
            }
        });
    });

    describe('DeleteActivity flow:', () => {
        it('handleDeleteActivity should call onDeleteActivity', async () => {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);
            try {
                await handler.handleDeleteActivity(AUTH_HEADER, 'convId', ACTIVITY.id, ACTIVITY);
            } catch (e) {
                strictEqual(e.message, createDefaultErrorMessage('onDeleteActivity'));
            }
        });
    });

    describe('GetActivityMembers flow:', () => {
        it('handleGetActivityMembers should call onGetActivityMembers', async () => {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);
            try {
                await handler.handleGetActivityMembers(AUTH_HEADER, 'convId', ACTIVITY.id);
            } catch (e) {
                strictEqual(e.message, createDefaultErrorMessage('onGetActivityMembers'));
            }
        });
    });

    describe('CreateConversation flow:', () => {
        it('handleCreateConversation should call onCreateConversation', async () => {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);
            try {
                await handler.handleCreateConversation(AUTH_HEADER, { isGroup: false });
            } catch (e) {
                strictEqual(e.message, createDefaultErrorMessage('onCreateConversation'));
            }
        });
    });

    describe('GetConversations flow:', () => {
        it('handleGetConversations should call onGetConversations', async () => {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);
            try {
                await handler.handleGetConversations(AUTH_HEADER, 'convId');
            } catch (e) {
                strictEqual(e.message, createDefaultErrorMessage('onGetConversations'));
            }
        });
    });

    describe('ConversationMembers flow:', () => {
        it('handleGetConversationMembers should call onGetConversationMembers', async () => {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);
            try {
                await handler.handleGetConversationMembers(AUTH_HEADER, 'convId');
            } catch (e) {
                strictEqual(e.message, createDefaultErrorMessage('onGetConversationMembers'));
            }
        });
        
        it('handleGetConversationPagedMembers should call onGetConversationPagedMembers', async () => {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);
            try {
                await handler.handleGetConversationPagedMembers(AUTH_HEADER, 'convId');
            } catch (e) {
                strictEqual(e.message, createDefaultErrorMessage('onGetConversationPagedMembers'));
            }
        });
        
        it('handleDeleteConversationMember should call onDeleteConversationMember', async () => {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);
            try {
                await handler.handleDeleteConversationMember(AUTH_HEADER, 'convId', 'memberId');
            } catch (e) {
                strictEqual(e.message, createDefaultErrorMessage('onDeleteConversationMember'));
            }
        });
    });
        
        describe('GetSendConversationHistory flow:', () => {
            it('handleSendConversationHistory should call onSendConversationHistory', async () => {
                const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);
                try {
                    await handler.handleSendConversationHistory(AUTH_HEADER, 'convId', { ACTIVITY });
            } catch (e) {
                strictEqual(e.message, createDefaultErrorMessage('onSendConversationHistory'));
            }
        });
    });

    describe('GetUploadAttachment flow:', () => {
        it('handleUploadAttachment should call onUploadAttachment', async () => {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);
            try {
                await handler.handleUploadAttachment(AUTH_HEADER, 'convId', { type: 'string', name: 'attachment' });
            } catch (e) {
                strictEqual(e.message, createDefaultErrorMessage('onUploadAttachment'));
            }
        });
    });

    describe('Authentication flow:', () => {
        it('authenticate should return an empty claim when no authHeader is provided', async () => {
            const channelService = 'channels';
            const handler = new ChannelServiceHandler(CREDENTIALS, AUTH_CONFIG, channelService);
            const result = await handler.authenticate();

            isEmpty(result.claims);
            strictEqual(result.isAuthenticated, false);
        });

        it('authenticate should return a valid claim identity', async () => {
            const channelService = 'channels';
            const handler = new ChannelServiceHandler(CREDENTIALS, AUTH_CONFIG, channelService);
            const authHeaderStub = stub(JwtTokenValidation, 'validateAuthHeader');
            authHeaderStub.returns(new ClaimsIdentity([], true));

            const identity = await handler.authenticate(AUTH_HEADER);
            try {
                assert(authHeaderStub.called, 'JwtTokenValidation.validateAuthHeader() not called');
                assert.strictEqual(identity.isAuthenticated, true);
            } finally {
                authHeaderStub.restore();
            }
        });

        it('authenticate should throw an UNAUTHORIZED error', async () => {
            const channelService = 'channels';
            const handler = new ChannelServiceHandler(CREDENTIALS, AUTH_CONFIG, channelService);
            try {
                await handler.authenticate(AUTH_HEADER);
            } catch (e) {
                strictEqual(e.statusCode, StatusCodes.UNAUTHORIZED)
            }
        });
    });
});