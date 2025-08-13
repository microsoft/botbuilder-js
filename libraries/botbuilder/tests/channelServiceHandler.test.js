const assert = require('assert');
const sinon = require('sinon');
const { ActivityTypes, StatusCodes } = require('botbuilder-core');
const { ChannelServiceHandler } = require('../');
const isEmpty = require('lodash/isEmpty');

const {
    AuthenticationConfiguration,
    AuthenticationConstants,
    ClaimsIdentity,
    JwtTokenValidation,
    SimpleCredentialProvider,
} = require('botframework-connector');

const AUTH_HEADER = 'Bearer HelloWorld';
const AUTH_CONFIG = new AuthenticationConfiguration();
const CREDENTIALS = new SimpleCredentialProvider('appId', 'appSecret');
const ACTIVITY = { id: 'testId', type: ActivityTypes.Message };

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

const matchStatusCodeError = (methodName) => ({
    name: 'StatusCodeError',
    message: `ChannelServiceHandler.${methodName}(): 501: Not Implemented`,
});

describe('ChannelServiceHandler', function () {
    const handler = new ChannelServiceHandler(CREDENTIALS, AUTH_CONFIG, 'channels');

    let sandbox;

    beforeEach(function () {
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('constructor', function () {
        it('should succeed with valid parameters', function () {
            const channelService = 'channels';
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG, channelService);

            assert.strictEqual(handler.authConfig, AUTH_CONFIG);
            assert.strictEqual(handler.credentialProvider, CREDENTIALS);
            assert.strictEqual(handler.channelService, channelService);
        });

        it('should use process.env.ChannelService if no channelService is provided', function () {
            process.env[AuthenticationConstants.ChannelService] = 'test';
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);

            assert.strictEqual(handler.authConfig, AUTH_CONFIG);
            assert.strictEqual(handler.credentialProvider, CREDENTIALS);
            assert.strictEqual(handler.channelService, 'test');
            delete process.env[AuthenticationConstants.ChannelService];
        });

        it('should fail with invalid credentialProvider or authConfig', function () {
            assert.throws(() => new NoAuthHandler(), {
                message: 'ChannelServiceHandler(): missing credentialProvider',
            });

            assert.throws(() => new NoAuthHandler(CREDENTIALS), {
                message: 'ChannelServiceHandler(): missing authConfig',
            });
        });
    });

    describe('SendToConversation flow:', function () {
        it('handleSendToConversation should call onSendToConversation', async function () {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);

            await assert.rejects(
                handler.handleSendToConversation(AUTH_HEADER, 'convId', { type: ActivityTypes.Message }),
                matchStatusCodeError('onSendToConversation'),
            );
        });
    });

    describe('ReplyToActivity flow:', function () {
        it('handleReplyToActivity should call onReplyToActivity', async function () {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);

            await assert.rejects(
                handler.handleReplyToActivity(AUTH_HEADER, 'convId', ACTIVITY.id, ACTIVITY),
                matchStatusCodeError('onReplyToActivity'),
            );
        });
    });

    describe('UpdateActivity flow:', function () {
        it('handleUpdateActivity should call onUpdateActivity', async function () {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);

            await assert.rejects(
                handler.handleUpdateActivity(AUTH_HEADER, 'convId', ACTIVITY.id, ACTIVITY),
                matchStatusCodeError('onUpdateActivity'),
            );
        });
    });

    describe('DeleteActivity flow:', function () {
        it('handleDeleteActivity should call onDeleteActivity', async function () {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);

            await assert.rejects(
                handler.handleDeleteActivity(AUTH_HEADER, 'convId', ACTIVITY.id, ACTIVITY),
                matchStatusCodeError('onDeleteActivity'),
            );
        });
    });

    describe('GetActivityMembers flow:', function () {
        it('handleGetActivityMembers should call onGetActivityMembers', async function () {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);

            await assert.rejects(
                handler.handleGetActivityMembers(AUTH_HEADER, 'convId', ACTIVITY.id),
                matchStatusCodeError('onGetActivityMembers'),
            );
        });
    });

    describe('CreateConversation flow:', function () {
        it('handleCreateConversation should call onCreateConversation', async function () {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);

            await assert.rejects(
                handler.handleCreateConversation(AUTH_HEADER, { isGroup: false }),
                matchStatusCodeError('onCreateConversation'),
            );
        });
    });

    describe('GetConversations flow:', function () {
        it('handleGetConversations should call onGetConversations', async function () {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);

            await assert.rejects(
                handler.handleGetConversations(AUTH_HEADER, 'convId'),
                matchStatusCodeError('onGetConversations'),
            );
        });
    });

    describe('ConversationMembers flow:', function () {
        it('handleGetConversationMembers should call onGetConversationMembers', async function () {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);

            await assert.rejects(
                handler.handleGetConversationMembers(AUTH_HEADER, 'convId'),
                matchStatusCodeError('onGetConversationMembers'),
            );
        });

        it('handleGetConversationPagedMembers should call onGetConversationPagedMembers', async function () {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);

            await assert.rejects(
                handler.handleGetConversationPagedMembers(AUTH_HEADER, 'convId'),
                matchStatusCodeError('onGetConversationPagedMembers'),
            );
        });

        it('handleDeleteConversationMember should call onDeleteConversationMember', async function () {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);

            await assert.rejects(
                handler.handleDeleteConversationMember(AUTH_HEADER, 'convId', 'memberId'),
                matchStatusCodeError('onDeleteConversationMember'),
            );
        });
    });

    describe('GetSendConversationHistory flow:', function () {
        it('handleSendConversationHistory should call onSendConversationHistory', async function () {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);

            await assert.rejects(
                handler.handleSendConversationHistory(AUTH_HEADER, 'convId', { ACTIVITY }),
                matchStatusCodeError('onSendConversationHistory'),
            );
        });
    });

    describe('GetUploadAttachment flow:', function () {
        it('handleUploadAttachment should call onUploadAttachment', async function () {
            const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);

            await assert.rejects(
                handler.handleUploadAttachment(AUTH_HEADER, 'convId', { type: 'string', name: 'attachment' }),
                matchStatusCodeError('onUploadAttachment'),
            );
        });
    });

    describe('Authentication flow:', function () {
        describe('authenticate() with no auth header', function () {
            const mockAuthDisabled = (isDisabled) =>
                sandbox
                    .mock(handler.credentialProvider)
                    .expects('isAuthenticationDisabled')
                    .once()
                    .returns(Promise.resolve(isDisabled));

            it('should return a skill claim when auth is disabled', async function () {
                mockAuthDisabled(true);

                const result = await handler.authenticate();
                assert(result.isAuthenticated, 'isAuthenticated is true');

                assert(!isEmpty(result.claims), 'result.claims is not empty');
                const appIdClaim = result.claims.find((claim) => claim.type === AuthenticationConstants.AppIdClaim);
                assert(appIdClaim, 'app ID claim is set');
                assert.strictEqual(appIdClaim.value, AuthenticationConstants.AnonymousSkillAppId);

                sandbox.verify();
            });

            it('should throw an error when auth is enabled', async function () {
                mockAuthDisabled(false);

                await assert.rejects(handler.authenticate(), { statusCode: StatusCodes.UNAUTHORIZED });

                sandbox.verify();
            });
        });

        describe('authenticate() with an auth header', function () {
            it('should return a valid claim identity', async function () {
                sandbox
                    .mock(JwtTokenValidation)
                    .expects('validateAuthHeader')
                    .once()
                    .returns(new ClaimsIdentity([], AuthenticationConstants.AnonymousAuthType));

                const identity = await handler.authenticate(AUTH_HEADER);
                assert(identity.isAuthenticated, 'isAuthenticated is true');

                sandbox.verify();
            });

            it('should throw an UNAUTHORIZED error for a bad auth header', async function () {
                await assert.rejects(handler.authenticate(AUTH_HEADER), { statusCode: StatusCodes.UNAUTHORIZED });
            });
        });
    });
});
