const assert = require('assert');
const { ActivityTypes, TurnContext } = require('botbuilder-core');
const connector = require('botframework-connector');
const {
    AuthenticationConstants,
    CertificateAppCredentials,
    ClaimsIdentity,
    ConnectorClient,
    GovernmentConstants,
    JwtTokenValidation,
    MicrosoftAppCredentials } = require('botframework-connector');
const { spy, stub } = require('sinon');
const { BotFrameworkAdapter } = require('../');

const reference = {
    activityId: '1234',
    channelId: 'test',
    serviceUrl: 'https://example.org/channel',
    user: { id: 'user', name: 'User Name' },
    bot: { id: 'bot', name: 'Bot Name' },
    conversation: { 
        id: 'convo1',
        properties: {
            'foo': 'bar'
        }
    }
};
const incomingMessage = TurnContext.applyConversationReference({ text: 'test', type: 'message' }, reference, true);
const outgoingMessage = TurnContext.applyConversationReference({ text: 'test', type: 'message' }, reference);
const incomingInvoke = TurnContext.applyConversationReference({ type: 'invoke' }, reference, true);

class AdapterUnderTest extends BotFrameworkAdapter {
    constructor(settings) {
        super(settings);
        this.failAuth = false;
        this.failOperation = false;
        this.expectAuthHeader = '';
        this.newServiceUrl = undefined;
    }

    getOAuthScope() {
        return this.credentials.oAuthScope;
    }

    async testAuthenticateRequest(request, authHeader) {
        const claims = await super.authenticateRequestInternal(request, authHeader);
        if (!claims.isAuthenticated) { throw new Error('Unauthorized Access. Request is not authorized'); }
    }
    testCreateConnectorClient(serviceUrl) { return super.createConnectorClient(serviceUrl) }

    authenticateRequest(request, authHeader) {
        return this.authenticateRequestInternal.bind(this)(request, authHeader);
    }

    authenticateRequestInternal(request, authHeader) {
        assert(request, `authenticateRequestInternal() not passed request.`);
        assert(authHeader === this.expectAuthHeader, `authenticateRequestInternal() not passed expected authHeader.`);
        return this.failAuth ? Promise.reject(new Error('failed auth')) : Promise.resolve({ claims: [] });
    }

    createConnectorClient(serviceUrl) {
        assert(serviceUrl, `createConnectorClient() not passed serviceUrl.`);
        return this.mockConnectorClient.bind(this)();
    }

    createConnectorClientWithIdentity(serviceUrl, identity) {
        assert(serviceUrl, `createConnectorClientWithIdentity() not passed serviceUrl.`);
        assert(identity, `createConnectorClientWithIdentity() not passed identity.`);
        return this.mockConnectorClient.bind(this)();
    }

    createConnectorClientInternal(serviceUrl, credentials) {
        assert(serviceUrl, `createConnectorClientInternal() not passed serviceUrl.`);
        assert(credentials, `createConnectorClientInternal() not passed credentials.`);
        return this.mockConnectorClient.bind(this)();
    }
    getOrCreateConnectorClient(context, serviceUrl, credentials) {
        assert(context, `createConnectorClient() not passed context.`);
        assert(serviceUrl, `createConnectorClient() not passed serviceUrl.`);
        assert(credentials, `createConnectorClient() not passed credentials.`);
        return this.mockConnectorClient.bind(this)();
    }

    mockConnectorClient() {
        return {
            conversations: {
                replyToActivity: (conversationId, activityId, activity) => {
                    assert(conversationId, `replyToActivity() not passed conversationId.`);
                    assert(activityId, `replyToActivity() not passed activityId.`);
                    assert(activity, `replyToActivity() not passed activity.`);
                    return this.failOperation ? Promise.reject(new Error(`failed`)) : Promise.resolve({ id: '5678' });
                },
                sendToConversation: (conversationId, activity) => {
                    assert(conversationId, `sendToConversation() not passed conversationId.`);
                    assert(activity, `sendToConversation() not passed activity.`);
                    return this.failOperation ? Promise.reject(new Error(`failed`)) : Promise.resolve({ id: '5678' });
                },
                updateActivity: (conversationId, activityId, activity) => {
                    assert(conversationId, `updateActivity() not passed conversationId.`);
                    assert(activityId, `updateActivity() not passed activityId.`);
                    assert(activity, `updateActivity() not passed activity.`);
                    return this.failOperation ? Promise.reject(new Error(`failed`)) : Promise.resolve({ id: '5678' });
                },
                deleteActivity: (conversationId, activityId) => {
                    assert(conversationId, `deleteActivity() not passed conversationId.`);
                    assert(activityId, `deleteActivity() not passed activityId.`);
                    return this.failOperation ? Promise.reject(new Error(`failed`)) : Promise.resolve();
                },
                createConversation: (parameters) => {
                    assert(parameters, `createConversation() not passed parameters.`);
                    return this.failOperation ? Promise.reject(new Error(`failed`)) : Promise.resolve({ id: 'convo2', serviceUrl: this.newServiceUrl });
                }
            }
        };
    }
}

class MockRequest {
    constructor(body, headers) {
        this.data = JSON.stringify(body);
        this.headers = headers || {};
    }

    on(event, handler) {
        switch (event) {
            case 'data':
                handler(this.data);
                break;
            case 'end':
                handler();
                break;
        }
    }
}

class MockBodyRequest {
    constructor(body, headers) {
        this.body = body;
        this.headers = headers || {};
    }

    on(event, handler) {
        assert(false, `unexpected call to request.on().`);
    }
}

class MockResponse {
    constructor() {
        this.ended = false;
        this.statusCode = undefined;
        this.body = undefined;
    }

    status(status) {
        this.statusCode = status;
    }

    send(body) {
        assert(!this.ended, `response.send() called after response.end().`);
        this.body = body;
    }

    end() {
        assert(!this.ended, `response.end() called twice.`);
        assert(this.statusCode !== undefined, `response.end() called before response.send().`);
        this.ended = true;
    }
}

function assertResponse(res, statusCode, hasBody) {
    assert(res.ended, `response not ended.`);
    assert.strictEqual(res.statusCode, statusCode);
    if (hasBody) {
        assert(res.body, `response missing body.`);
    } else {
        assert.strictEqual(res.body, undefined);
    }
}

describe(`BotFrameworkAdapter`, function () {
    this.timeout(5000);
    describe('constructor()', () => {
        it(`should use CertificateAppCredentials when certificateThumbprint and certificatePrivateKey are provided`, () => {
            const certificatePrivateKey = 'key';
            const certificateThumbprint = 'thumbprint';
            const appId = '11111111-7777-8888-9999-333333333333';

            const adapter = new BotFrameworkAdapter({ appId, certificatePrivateKey, certificateThumbprint });
            assert(adapter.credentials instanceof CertificateAppCredentials);
            assert.strictEqual(adapter.credentials.appId, appId);
            assert.strictEqual(adapter.credentials.certificatePrivateKey, certificatePrivateKey);
            assert.strictEqual(adapter.credentials.certificateThumbprint, certificateThumbprint);

            assert.strictEqual(adapter.settings.appId, appId);
            assert.strictEqual(adapter.settings.appPassword, '');
        });

        it(`should use CertificateAppCredentials over MicrosoftAppCredentials when certificateThumbprint and certificatePrivateKey are provided`, () => {
            const certificatePrivateKey = 'key';
            const certificateThumbprint = 'thumbprint';
            const appId = '11111111-7777-8888-9999-333333333333';
            const appPassword = 'password';
    
            const adapter = new BotFrameworkAdapter({
                appId,
                certificatePrivateKey,
                certificateThumbprint,
                appPassword
            });

            assert(adapter.credentials instanceof CertificateAppCredentials);
            assert.strictEqual(adapter.credentials.appId, appId);
            assert.strictEqual(adapter.credentials.certificatePrivateKey, certificatePrivateKey);
            assert.strictEqual(adapter.credentials.certificateThumbprint, certificateThumbprint);
            // adapter.credentialsProvider should have an empty string for a password.
            assert.strictEqual(adapter.credentialsProvider.appPassword, '');
            // appPassword should still be stored in BotFrameworkAdapter.settings through the spread syntax.
            assert.strictEqual(adapter.settings.appPassword, appPassword);
        });

        it(`should read ChannelService and BotOpenIdMetadata env var if they exist`, function () {
            process.env.ChannelService = 'https://botframework.azure.us';
            process.env.BotOpenIdMetadata = 'https://someEndpoint.com';
            const adapter = new AdapterUnderTest();
    
            assert(adapter.settings.channelService === 'https://botframework.azure.us', `Adapter should have read process.env.ChannelService`);
            assert(adapter.settings.openIdMetadata === 'https://someEndpoint.com', `Adapter should have read process.env.ChannelService`);
            delete process.env.ChannelService;
            delete process.env.BotOpenIdMetadata;
        });
    });

    describe('authenticateRequest()', () => {
        it(`should work if no appId or appPassword.`, async () => {
            const req = new MockRequest(incomingMessage);
            const adapter = new AdapterUnderTest();
            await adapter.testAuthenticateRequest(req, '');
        });

        it('should work if no appId or appPassword and discard callerId', async () => {
            // Create activity with callerId
            const incoming = TurnContext.applyConversationReference({ type: 'message', text: 'foo', callerId: 'foo' }, reference, true);
            incoming.channelId = 'msteams';
    
            // Create Adapter, stub and spy for indirectly called methods
            const adapter = new BotFrameworkAdapter();
            const authReqStub = stub(JwtTokenValidation, 'authenticateRequest');
            authReqStub.returns(new ClaimsIdentity([], true));

            await adapter.authenticateRequest(incoming, 'authHeader');
            try {
                assert(authReqStub.called, 'JwtTokenValidation.authenticateRequest() not called');
                assert.strictEqual(incoming.callerId, undefined);
            } finally {
                authReqStub.restore();
            }
        });

        it('should stamp over received callerId', async () => {
            // Create activity with callerId
            const incoming = TurnContext.applyConversationReference({ type: 'message', text: 'foo', callerId: 'foo' }, reference, true);
            incoming.channelId = 'msteams';
    
            // Create Adapter, stub and spy for indirectly called methods
            const adapter = new BotFrameworkAdapter();
            const authReqStub = stub(JwtTokenValidation, 'authenticateRequest');
            adapter.credentialsProvider.isAuthenticationDisabled = async () => false;
            authReqStub.returns(new ClaimsIdentity([], true));
            const generateCallerIdSpy = spy(adapter, 'generateCallerId');

            await adapter.authenticateRequest(incoming, 'authHeader');
            try {
                assert(authReqStub.called, 'JwtTokenValidation.authenticateRequest() not called');
                assert(generateCallerIdSpy.called, 'generateCallerId was not called');
                assert.strictEqual(incoming.callerId, 'urn:botframework:azure');
            } finally {
                authReqStub.restore();
            }
        });

        it(`should fail if appId+appPassword and no headers.`, async () => {
            const req = new MockRequest(incomingMessage);
            const adapter = new AdapterUnderTest({ appId: 'bogusApp', appPassword: 'bogusPassword' });
            try {
                await adapter.testAuthenticateRequest(req, '');
            } catch (e) {
                assert.strictEqual(e.message, 'Unauthorized Access. Request is not authorized');
            }
        });
    });

    describe('buildCredentials()', () => {
        it('should return credentials with correct parameters', async () => {
            const adapter = new BotFrameworkAdapter({appId: 'appId', appPassword: 'appPassword'});
            const creds = await adapter.buildCredentials('appId', 'scope');
            assert.strictEqual(creds.appId, 'appId');
            assert.strictEqual(creds.appPassword, 'appPassword');
            assert.strictEqual(creds.oAuthScope, 'scope');
        });
    
        it('should return credentials with default public Azure values', async () => {
            const adapter = new BotFrameworkAdapter({appId: 'appId', appPassword: 'appPassword'});
            const creds = await adapter.buildCredentials('appId');
            assert.strictEqual(creds.appId, 'appId');
            assert.strictEqual(creds.appPassword, 'appPassword');
            assert.strictEqual(creds.oAuthScope, AuthenticationConstants.ToBotFromChannelTokenIssuer);
    
            const oAuthEndpoint = AuthenticationConstants.ToChannelFromBotLoginUrlPrefix + AuthenticationConstants.DefaultChannelAuthTenant;
            assert.strictEqual(creds.oAuthEndpoint, oAuthEndpoint);
        });
    });

    describe('get/create ConnectorClient methods', () => {
        it(`should createConnectorClient().`, function (done) {
            const req = new MockRequest(incomingMessage);
            const adapter = new AdapterUnderTest();
            const client = adapter.testCreateConnectorClient(reference.serviceUrl);
            assert(client, `client not returned.`);
            assert(client.conversations, `invalid client returned.`);
            done();
        });

        it('getOrCreateConnectorClient should create a new client if the cached serviceUrl does not match the provided one', () => {
            const adapter = new BotFrameworkAdapter();
            const context = new TurnContext(adapter, { type: ActivityTypes.Message, text: 'hello', serviceUrl: 'http://bing.com' });
            const cc = new ConnectorClient(new MicrosoftAppCredentials('', ''), {baseUri: 'http://bing.com'});
            context.turnState.set(adapter.ConnectorClientKey, cc);

            const client = adapter.getOrCreateConnectorClient(context, 'https://botframework.com', adapter.credentials);
            assert.notEqual(client.baseUri, cc.baseUri);
        });
    });

    it(`processActivity() should respect expectReplies if it's set via logic`, async () => {
        const req = new MockRequest(incomingMessage);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        await adapter.processActivity(req, res, async (context) => {
            context.activity.deliveryMode = 'expectReplies';
            await context.sendActivity({ type: 'message', text: 'Hello Buffered World!' });
        });
        assertResponse(res, 200, true);
    });

    it(`processActivity() should not respect invokeResponses if the incoming request was of type "invoke"`, async () => {
        const req = new MockRequest(incomingMessage);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        await adapter.processActivity(req, res, async (context) => {
            await context.sendActivity({ type: 'invokeResponse', text: 'InvokeResponse Test' });
        });
        assertResponse(res, 200, false);
    });

    it(`should processActivity().`, function (done) {
        let called = false;
        const req = new MockRequest(incomingMessage);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processActivity(req, res, (context) => {
            assert(context, `context not passed.`);
            called = true;
        }).then(() => {
            assert(called, `bot logic not called.`);
            assertResponse(res, 200);
            done();
        });
    });

    it(`should processActivity() sent as body.`, function (done) {
        let called = false;
        const req = new MockBodyRequest(incomingMessage);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processActivity(req, res, (context) => {
            assert(context, `context not passed.`);
            called = true;
        }).then(() => {
            assert(called, `bot logic not called.`);
            assertResponse(res, 200);
            done();
        });
    });

    it(`should check timestamp in processActivity() sent as body.`, function (done) {
        let called = false;
        let message = incomingMessage;
        message.timestamp = '2018-10-01T14:14:54.790Z';
        message.localTimestamp = '2018-10-01T14:14:54.790Z';
        const req = new MockBodyRequest(message);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processActivity(req, res, (context) => {
            assert(context, `context not passed.`);
            assert.equal(typeof context.activity.timestamp, 'object', `'context.activity.timestamp' is not a date`);
            assert(context.activity.timestamp instanceof Date, `'context.activity.timestamp' is not a date`);
            assert.equal(typeof context.activity.localTimestamp, 'object', `'context.activity.localTimestamp' is not a date`);
            assert(context.activity.localTimestamp instanceof Date, `'context.activity.localTimestamp' is not a date`);
            called = true;
        }).then(() => {
            assert(called, `bot logic not called.`);
            assertResponse(res, 200);
            done();
        });
    });

    it(`should reject a bogus request sent to processActivity().`, function (done) {
        const req = new MockRequest('bogus');
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processActivity(req, res, (context) => {
            assert(false, `shouldn't have called bot logic.`);
        }).then(() => {
            assert(false, `shouldn't have passed.`);
        }, (err) => {
            assert(err, `error not returned.`);
            assertResponse(res, 400, true);
            done();
        });
    });

    it(`should reject a request without activity type sent to processActivity().`, function (done) {
        const req = new MockBodyRequest({ text: 'foo' });
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processActivity(req, res, (context) => {
            assert(false, `shouldn't have called bot logic.`);
        }).then(() => {
            assert(false, `shouldn't have passed.`);
        }, (err) => {
            assert(err, `error not returned.`);
            assertResponse(res, 400, true);
            done();
        });
    });

    it(`should migrate location of tenantId for MS Teams processActivity().`, function (done) {
        const incoming = TurnContext.applyConversationReference({ type: 'message', text: 'foo', channelData: { tenant: { id: '1234' } } }, reference, true);
        incoming.channelId = 'msteams';
        const req = new MockBodyRequest(incoming);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processActivity(req, res, (context) => {
            assert(context.activity.conversation.tenantId === '1234', `should have copied tenant id from channelData to conversation address`);
            done();
        });
    });

    it(`receive a semanticAction with a state property on the activity in processActivity().`, function (done) {
        const incoming = TurnContext.applyConversationReference({ type: 'message', text: 'foo', semanticAction: { state: 'start' } }, reference, true);
        incoming.channelId = 'msteams';
        const req = new MockBodyRequest(incoming);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processActivity(req, res, (context) => {
            assert(context.activity.semanticAction.state === 'start');
            done();
        });
    });

    describe('callerId generation', function() {    
        it(`should ignore received and generate callerId on parsed activity in processActivity()`, (done) => {
            const incoming = TurnContext.applyConversationReference({ type: 'message', text: 'foo', callerId: 'foo' }, reference, true);
            incoming.channelId = 'msteams';
            const req = new MockBodyRequest(incoming);
            const res = new MockResponse();
            const adapter = new BotFrameworkAdapter({});
            const authReqStub = stub(JwtTokenValidation, 'authenticateRequest');
            adapter.credentialsProvider.isAuthenticationDisabled = async () => false;
            authReqStub.returns(new ClaimsIdentity([], true));
            adapter.onTurnError = async (_, err) => {
                authReqStub.restore();
                done(err);
            };

            const generateCallerIdSpy = spy(adapter, 'generateCallerId');

            adapter.processActivity(req, res, async (context) => {
                assert(authReqStub.called, 'JwtTokenValidation.authenticateRequest() not called');
                assert(generateCallerIdSpy.called, 'generateCallerId was not called');
                assert.strictEqual(context.activity.callerId, 'urn:botframework:azure');
                authReqStub.restore();
                done();
            }).catch(e => {
                authReqStub.restore();
                done(e);
            });
        });
    
        it(`should generate a skill callerId property on the activity in processActivity()`, (done) => {
            const skillAppId = '00000000-0000-0000-0000-000000000000';
            const skillConsumerAppId = '00000000-0000-0000-0000-000000000001';
            const incoming = TurnContext.applyConversationReference({ type: 'message', text: 'foo' }, reference, true);
            incoming.channelId = 'msteams';
            const req = new MockBodyRequest(incoming);
            const res = new MockResponse();
            const adapter = new BotFrameworkAdapter();
            const authReqStub = stub(JwtTokenValidation, 'authenticateRequest');
            adapter.credentialsProvider.isAuthenticationDisabled = async () => false;
            authReqStub.returns(new ClaimsIdentity([
                { type: AuthenticationConstants.AudienceClaim, value: skillAppId },
                { type: AuthenticationConstants.AppIdClaim, value: skillConsumerAppId },
                { type: AuthenticationConstants.VersionClaim, value: '1.0' },
            ], true));
            adapter.onTurnError = async (_, err) => {
                authReqStub.restore();
                done(err);
            };
    
            const generateCallerIdSpy = spy(adapter, 'generateCallerId');

            adapter.processActivity(req, res, async (context) => {
                assert(authReqStub.called, 'JwtTokenValidation.authenticateRequest() not called');
                assert(generateCallerIdSpy.called, 'generateCallerId was not called');
                assert.strictEqual(context.activity.callerId, `urn:botframework:aadappid:${ skillConsumerAppId }`);
                authReqStub.restore();
                done();
            }).catch(e => {
                authReqStub.restore();
                done(e);
            });
        });

        it(`should discard & not generate callerId on the parsed activity with disabledAuth`, (done) => {
            const incoming = TurnContext.applyConversationReference({ type: 'message', text: 'foo', callerId: 'foo' }, reference, true);
            incoming.channelId = 'msteams';
            const req = new MockBodyRequest(incoming);
            const res = new MockResponse();
            const adapter = new BotFrameworkAdapter();
            const authReqStub = stub(JwtTokenValidation, 'authenticateRequest');
            authReqStub.resolves(new ClaimsIdentity([], true));
            adapter.onTurnError = async (_, err) => {
                authReqStub.restore();
                done(err);
            };
            adapter.processActivity(req, res, async (context) => {
                assert.strictEqual(context.activity.callerId, undefined);
                authReqStub.restore();
                done();
            }).catch(e => {
                authReqStub.restore();
                done(e);
            });
        });
    });

    it(`should receive a properties property on the conversation object in processActivity().`, async () => {
        const incoming = TurnContext.applyConversationReference({ type: 'message', text: 'foo', callerId: 'foo' }, reference, true);
        incoming.channelId = 'msteams';
        const req = new MockBodyRequest(incoming);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        await adapter.processActivity(req, res, async (context) => {
            assert(context.activity.conversation.properties.foo === 'bar');
        });
    });

    it(`should fail to auth on call to processActivity().`, function (done) {
        const req = new MockRequest(incomingMessage);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.failAuth = true;
        adapter.processActivity(req, res, (context) => {
            assert(false, `shouldn't have called bot logic.`);
        }).then(() => {
            assert(false, `shouldn't have passed.`);
        }, (err) => {
            try {
                assert(err, `error not returned.`);
                assertResponse(res, 401, true);
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it(`should return 500 error on bot logic exception during processActivity().`, function (done) {
        const req = new MockRequest(incomingMessage);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processActivity(req, res, (context) => {
            throw new Error(`bot exception`);
        }).then(() => {
            done(new Error(`shouldn't have passed.`));
        }, (err) => {
            assert(err, `error not returned.`);
            assertResponse(res, 500, true);
            done();
        });
    });

    it(`should createConversation().`, function (done) {
        let called = false;
        const adapter = new AdapterUnderTest();
        adapter.createConversation(reference, (context) => {
            assert(context, `context not passed.`);
            assert(context.activity, `context has no request.`);
            assert(context.activity.conversation && context.activity.conversation.id === 'convo2', `request has invalid conversation.id.`);
            called = true;
        }).then(() => {
            assert(called, `bot logic not called.`);
            done();
        });
    });

    it(`should createConversation() and assign new serviceUrl.`, function (done) {
        let called = false;
        const adapter = new AdapterUnderTest();
        adapter.newServiceUrl = 'https://example.org/channel2';
        adapter.createConversation(reference, (context) => {
            assert(context, `context not passed.`);
            assert(context.activity, `context has no request.`);
            assert(context.activity.conversation && context.activity.conversation.id === 'convo2', `request has invalid conversation.id.`);
            assert(context.activity.serviceUrl === 'https://example.org/channel2', `request has invalid conversation.id.`);
            called = true;
        }).then(() => {
            assert(called, `bot logic not called.`);
            done();
        });
    });

    it(`should fail to createConversation() if serviceUrl missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const bogus = Object.assign({}, reference);
        delete bogus.serviceUrl;
        adapter.createConversation(bogus, (context) => {
            assert(false, `bot logic shouldn't be called.`);
        }).then(() => {
            assert(false, `shouldn't have passed.`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should createConversation() for Teams.`, function (done) {
        const adapter = new AdapterUnderTest();
        adapter.createConversation(reference, (context) => {
            try{
                assert(context, `context not passed.`);
                assert(context.activity, `context has no request.`);
                assert(context.activity.conversation, `request has invalid conversation.`);
                assert.strictEqual(context.activity.conversation.id, 'convo2', `request has invalid conversation.id.`);
                assert.strictEqual(context.activity.conversation.tenantId, reference.conversation.tenantId, `request has invalid tenantId on conversation.`);
                assert.strictEqual(context.activity.channelData.tenant.id, reference.conversation.tenantId, `request has invalid tenantId in channelData.`);
                done();
            } catch(err) {
                done(err);
            }
        });
    });

    it(`should deliver a single activity using sendActivities().`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        adapter.sendActivities(context, [outgoingMessage]).then((responses) => {
            try {
                assert(Array.isArray(responses), `array of responses not returned.`);
                assert(responses.length === 1, `invalid number of responses returned.`);
                assert(responses[0].id === '5678', `invalid response returned.`);
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it(`should deliver multiple activities using sendActivities().`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        adapter.sendActivities(context, [outgoingMessage, outgoingMessage]).then((responses) => {
            try {
                assert(Array.isArray(responses), `array of responses not returned.`);
                assert(responses.length === 2, `invalid number of responses returned.`);
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it(`should wait for a 'delay' using sendActivities().`, function (done) {
        const start = new Date().getTime();
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        adapter.sendActivities(context, [outgoingMessage, { type: 'delay', value: 600 }, outgoingMessage]).then((responses) => {
            const end = new Date().getTime();
            assert(Array.isArray(responses), `array of responses not returned.`);
            assert(responses.length === 3, `invalid number of responses returned.`);
            assert((end - start) >= 500, `didn't pause for delay.`);
            done();
        });
    });

    it(`should wait for a 'delay' withut a value using sendActivities().`, function (done) {
        const start = new Date().getTime();
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        adapter.sendActivities(context, [outgoingMessage, { type: 'delay' }, outgoingMessage]).then((responses) => {
            const end = new Date().getTime();
            assert(Array.isArray(responses), `array of responses not returned.`);
            assert(responses.length === 3, `invalid number of responses returned.`);
            assert((end - start) >= 500, `didn't pause for delay.`);
            done();
        });
    });

    it(`should return bots 'invokeResponse'.`, function (done) {
        const req = new MockRequest(incomingInvoke);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processActivity(req, res, (context) => {
            return context.sendActivity({ type: 'invokeResponse', value: { status: 200, body: 'body' }});
        }).then(() => {
            try {
                assertResponse(res, 200, true);
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it(`should return 501 error if bot fails to return an 'invokeResponse'.`, function (done) {
        const req = new MockRequest(incomingInvoke);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processActivity(req, res, (context) => {
            // don't return anything
        }).then(() => {
            assert(false, `processActivtiy with InvokeResponse shouldn't passed.`);
        }, (err) => {
            try {
                assert.notStrictEqual(err.message, `processActivtiy with InvokeResponse shouldn't passed.`);
                assert(err, `error not returned.`);
                assertResponse(res, 501, false);
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it(`should fail to sendActivities().`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        adapter.failOperation = true;
        const cpy = Object.assign({}, outgoingMessage);
        adapter.sendActivities(context, [cpy]).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to sendActivities() without a serviceUrl.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, outgoingMessage, { serviceUrl: undefined });
        adapter.sendActivities(context, [cpy]).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to sendActivities() without a conversation.id.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, outgoingMessage, { conversation: undefined });
        adapter.sendActivities(context, [cpy]).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should post to a whole conversation using sendActivities() if replyToId missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, outgoingMessage, { replyToId: undefined });
        adapter.sendActivities(context, [cpy]).then((responses) => {
            assert(Array.isArray(responses), `array of responses not returned.`);
            assert(responses.length === 1, `invalid number of responses returned.`);
            assert(responses[0].id === '5678', `invalid response returned.`);
            done();
        });
    });

    it(`should updateActivity().`, async () => {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        await adapter.updateActivity(context, incomingMessage);
    });

    it(`should fail to updateActivity() if serviceUrl missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, incomingMessage, { serviceUrl: undefined });
        adapter.updateActivity(context, cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to updateActivity() if conversation missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, incomingMessage, { conversation: undefined });
        adapter.updateActivity(context, cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to updateActivity() if activity.id missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, incomingMessage, { id: undefined });
        adapter.updateActivity(context, cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should deleteActivity().`, async () => {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        await adapter.deleteActivity(context, reference);
    });

    it(`should fail to deleteActivity() if serviceUrl missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, reference, { serviceUrl: undefined });
        adapter.deleteActivity(context, cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to deleteActivity() if conversation missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, reference, { conversation: undefined });
        adapter.deleteActivity(context, cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to deleteActivity() if activityId missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, reference, { activityId: undefined });
        adapter.deleteActivity(context, cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    // This unit test doesn't work anymore because client.UserAgentInfo was removed, so we can't inspect the user agent string
    xit(`should create a User-Agent header with the same info as the host machine.`, function (done) {
        const adapter = new BotFrameworkAdapter();
        const client = adapter.createConnectorClient('https://example.com');
        //const userAgentHeader = client.userAgentInfo.value;
        const pjson = require('../package.json');
        const userAgent = 'Microsoft-BotFramework/3.1 BotBuilder/' + pjson.version + ' (Node.js,Version=' + process.version + '; ' + os.type() + ' ' + os.release() + '; ' + os.arch() + ')';
        // assert(userAgentHeader.includes(userAgent), `ConnectorClient doesn't have user-agent header created by BotFrameworkAdapter or header is incorrect.`);
        done();
    });

    it(`should set openIdMetadata property on ChannelValidation`, function (done) {
        const testEndpoint = "http://rainbows.com";
        const original = connector.ChannelValidation.OpenIdMetadataEndpoint;
        const adapter = new BotFrameworkAdapter({openIdMetadata: testEndpoint});
        assert(testEndpoint === connector.ChannelValidation.OpenIdMetadataEndpoint, `ChannelValidation.OpenIdMetadataEndpoint was not set.`);
	    connector.ChannelValidation.OpenIdMetadataEndpoint = original;
        done();
    });

    it(`should set openIdMetadata property on GovernmentChannelValidation`, function (done) {
        const testEndpoint = "http://azure.com/configuration";
        const original = connector.GovernmentChannelValidation.OpenIdMetadataEndpoint;
        const adapter = new BotFrameworkAdapter({openIdMetadata: testEndpoint});
        assert(testEndpoint === connector.GovernmentChannelValidation.OpenIdMetadataEndpoint, `GovernmentChannelValidation.OpenIdMetadataEndpoint was not set.`);
	    connector.GovernmentChannelValidation.OpenIdMetadataEndpoint = original;
        done();
    });

    it(`should set oAuthEndpoint property on connector client`, function (done) {
        const testEndpoint = "http://rainbows.com";
        const adapter = new BotFrameworkAdapter({oAuthEndpoint: testEndpoint});
        const url = adapter.oauthApiUrl();
        assert(testEndpoint === url, `adapter.oauthApiUrl is incorrect.`);
        done();
    });

    it(`should throw error if missing serviceUrl in deleteConversationMember()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.deleteConversationMember({ activity: {} });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.deleteConversationMember(): missing serviceUrl',
                `expected "BotFrameworkAdapter.deleteConversationMember(): missing serviceUrl" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing conversation in deleteConversationMember()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.deleteConversationMember({ activity: { serviceUrl: 'https://test.com' } });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.deleteConversationMember(): missing conversation or conversation.id',
                `expected "BotFrameworkAdapter.deleteConversationMember(): missing conversation or conversation.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing conversation.id in deleteConversationMember()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.deleteConversationMember({ activity: { serviceUrl: 'https://test.com', conversation: {} } });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.deleteConversationMember(): missing conversation or conversation.id',
                `expected "BotFrameworkAdapter.deleteConversationMember(): missing conversation or conversation.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing serviceUrl in getActivityMembers()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getActivityMembers({ activity: {} });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getActivityMembers(): missing serviceUrl',
                `expected "BotFrameworkAdapter.getActivityMembers(): missing serviceUrl" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing conversation in getActivityMembers()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getActivityMembers({ activity: { serviceUrl: 'https://test.com' } });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getActivityMembers(): missing conversation or conversation.id',
                `expected "BotFrameworkAdapter.getActivityMembers(): missing conversation or conversation.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing conversation.id in getActivityMembers()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getActivityMembers({ activity: { serviceUrl: 'https://test.com', conversation: {} } });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getActivityMembers(): missing conversation or conversation.id',
                `expected "BotFrameworkAdapter.getActivityMembers(): missing conversation or conversation.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing activityId in getActivityMembers()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getActivityMembers({ activity: { serviceUrl: 'https://test.com', conversation: { id: '1' } } });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getActivityMembers(): missing both activityId and context.activity.id',
                `expected "BotFrameworkAdapter.getActivityMembers(): missing both activityId and context.activity.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing serviceUrl in getConversationMembers()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getConversationMembers({ activity: {} });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getConversationMembers(): missing serviceUrl',
                `expected "BotFrameworkAdapter.getConversationMembers(): missing serviceUrl" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing conversation in getConversationMembers()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getConversationMembers({ activity: { serviceUrl: 'https://test.com' } });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getConversationMembers(): missing conversation or conversation.id',
                `expected "BotFrameworkAdapter.getConversationMembers(): missing conversation or conversation.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing conversation.id in getConversationMembers()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getConversationMembers({ activity: { serviceUrl: 'https://test.com', conversation: {} } });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getConversationMembers(): missing conversation or conversation.id',
                `expected "BotFrameworkAdapter.getConversationMembers(): missing conversation or conversation.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });
    
    it(`should throw error if missing from in getUserToken()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getUserToken({ activity: {}, turnState: new Map() });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getUserToken(): missing from or from.id',
                `expected "BotFrameworkAdapter.getUserToken(): missing from or from.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing from.id in getUserToken()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getUserToken({ activity: { from: {} }, turnState: new Map() });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getUserToken(): missing from or from.id',
                `expected "BotFrameworkAdapter.getUserToken(): missing from or from.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

	it(`should throw error if missing connectionName`, async function () {
		try {
			const adapter = new AdapterUnderTest();
			await adapter.getUserToken({ activity: { from: {id: 'some id'} }, turnState: new Map() });
		} catch (err) {
			assert(err.message === 'getUserToken() requires a connectionName but none was provided.',
				`expected "getUserToken() requires a connectionName but none was provided." Error message, not "${ err.message }"`);
			return;
		}
		assert(false, `should have thrown an error message`);
	});

	it(`should get the user token when all params are provided`, async function () {
		const argsPassedToMockClient = [];
		class MockTokenApiClient {
			constructor() {
				this.userToken = {
					getToken: async (...args) => {
						argsPassedToMockClient.push({getToken: args});
						return {
							token: 'yay! a token!',
							_response: {status: 200}
						}
					}
				}
			}

		}
		const {TokenApiClient} = connector;
		connector.TokenApiClient = MockTokenApiClient;
		const adapter = new AdapterUnderTest();
		const token = await adapter.getUserToken(
            { activity: { channelId: 'The Facebook', from: {id: 'some id'} }, turnState: new Map() },
			'aConnectionName');

		assert.ok(JSON.stringify(token) === JSON.stringify({
			'token': 'yay! a token!',
			'_response': {
				'status': 200
			}
		}));
		assert.ok(argsPassedToMockClient.length === 1);
		assert.ok(JSON.stringify(argsPassedToMockClient[0]) === JSON.stringify({getToken: [
			'some id',
			'aConnectionName',
			{
				'channelId': 'The Facebook'
			}
		]}));
		connector.TokenApiClient = TokenApiClient; // restore
	});

    it(`should throw error if missing from in signOutUser()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.signOutUser({ activity: {}, turnState: new Map() });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.signOutUser(): missing from or from.id',
                `expected "BotFrameworkAdapter.signOutUser(): missing from or from.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing from.id in signOutUser()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.signOutUser({ activity: { from: {} }, turnState: new Map() });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.signOutUser(): missing from or from.id',
                `expected "BotFrameworkAdapter.signOutUser(): missing from or from.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing from in getAadTokens()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getAadTokens({ activity: {}, turnState: new Map() });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getAadTokens(): missing from or from.id',
                `expected "BotFrameworkAdapter.getAadTokens(): missing from or from.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing from.id in getAadTokens()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getAadTokens({ activity: { from: {} }, turnState: new Map() });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getAadTokens(): missing from or from.id',
                `expected "BotFrameworkAdapter.getAadTokens(): missing from or from.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    describe('getSignInLink()', () => {
        it(`should throw if userName != from.id`, async () => {
            const adapter = new BotFrameworkAdapter();
            const context = new TurnContext(adapter, incomingMessage);
            try {
                const response = await adapter.getSignInLink(context, 'aConnectionName', new MicrosoftAppCredentials('abc', 'abc'), 'invalidId');
            } catch (err) {
                assert(err.message === `cannot retrieve OAuth signin link for a user that's different from the conversation`);
                return;
            }
            assert(false, `should have thrown an error message`);
        });
        it(`should return return a sign-in URL with context and connectionName`, async () => {
            const argsPassedToMockClient = [];
            class MockTokenApiClient {
                constructor() {
                    this.botSignIn = {
                        getSignInUrl: async (...args) => {
                            argsPassedToMockClient.push({getSignInUrl: args});
                            return {
                                _response: {status: 200, bodyAsText: 'http://mockedurl.com' }
                            }
                        }
                    };
                    this.credentials = new MicrosoftAppCredentials('abc', 'abc');
                }
    
            }
            const {TokenApiClient} = connector;
            connector.TokenApiClient = MockTokenApiClient;

            const adapter = new BotFrameworkAdapter();
            const context = new TurnContext(adapter, incomingMessage);
            const response = await adapter.getSignInLink(context, 'aConnectionName');
            assert(response, 'http://mockedurl.com');

            connector.TokenApiClient = TokenApiClient; // restore
        });
        it(`should return return a sign-in URL with context connectionName, oauthAppCredentials`, async () => {
            const argsPassedToMockClient = [];
            class MockTokenApiClient {
                constructor() {
                    this.botSignIn = {
                        getSignInUrl: async (...args) => {
                            argsPassedToMockClient.push({getSignInUrl: args});
                            return {
                                _response: {status: 200, bodyAsText: 'http://mockedurl.com' }
                            }
                        }
                    };
                    this.credentials = new MicrosoftAppCredentials('abc', 'abc');
                }
    
            }
            const {TokenApiClient} = connector;
            connector.TokenApiClient = MockTokenApiClient;

            const adapter = new BotFrameworkAdapter();
            const context = new TurnContext(adapter, incomingMessage);
            const response = await adapter.getSignInLink(context, 'aConnectionName', new MicrosoftAppCredentials('abc', 'abc'));
            assert(response, 'http://mockedurl.com');

            connector.TokenApiClient = TokenApiClient; // restore
        });
        it(`should return return a sign-in URL with context connectionName, oauthAppCredentials, userId, finalRedirect`, async () => {
            const argsPassedToMockClient = [];
            class MockTokenApiClient {
                constructor() {
                    this.botSignIn = {
                        getSignInUrl: async (...args) => {
                            argsPassedToMockClient.push({getSignInUrl: args});
                            return {
                                _response: {status: 200, bodyAsText: 'http://mockedurl.com' }
                            }
                        }
                    };
                    this.credentials = new MicrosoftAppCredentials('abc', 'abc');
                }
    
            }
            const {TokenApiClient} = connector;
            connector.TokenApiClient = MockTokenApiClient;

            const adapter = new BotFrameworkAdapter();
            const context = new TurnContext(adapter, incomingMessage);
            const response = await adapter.getSignInLink(context, 'aConnectionName', new MicrosoftAppCredentials('abc', 'abc'), incomingMessage.from.id, 'http://finalredirect.com');
            assert(response, 'http://mockedurl.com');

            connector.TokenApiClient = TokenApiClient; // restore
        });
    });

    describe('getTokenStatus()', () => {
        xit(`should return the status of every connection the user has`, async () => {
            const adapter = new AdapterUnderTest();
            const context = new TurnContext(adapter, incomingMessage);
            const responses = await adapter.getTokenStatus(context);
            assert(responses.length > 0);
        });

        it(`should throw error if missing from in getTokenStatus()`, async function () {
            try {
                const adapter = new AdapterUnderTest();
    
                await adapter.getTokenStatus({ activity: {}, turnState: new Map() });
            } catch (err) {
                assert(err.message === 'BotFrameworkAdapter.getTokenStatus(): missing from or from.id',
                    `expected "BotFrameworkAdapter.getTokenStatus(): missing from or from.id" Error message, not "${ err.message }"`);
                return;
            }
            assert(false, `should have thrown an error message`);
        });

        it(`should throw error if missing from.id in getTokenStatus()`, async function () {
            try {
                const adapter = new AdapterUnderTest();
                await adapter.getTokenStatus({ activity: { from: {} }, turnState: new Map() });
            } catch (err) {
                assert(err.message === 'BotFrameworkAdapter.getTokenStatus(): missing from or from.id',
                    `expected "BotFrameworkAdapter.getTokenStatus(): missing from or from.id" Error message, not "${ err.message }"`);
                return;
            }
            assert(false, `should have thrown an error message`);
        });
    });

    it('getOAuthScope', async () => {
        const adapter = new BotFrameworkAdapter({});
        // Missing botAppId
        assert.strictEqual(AuthenticationConstants.ToChannelFromBotOAuthScope, await adapter.getOAuthScope());

        // Empty Claims
        assert.strictEqual(AuthenticationConstants.ToChannelFromBotOAuthScope, await adapter.getOAuthScope('botAppId', []));

        // Non-skill Claims
        assert.strictEqual(AuthenticationConstants.ToChannelFromBotOAuthScope, await adapter.getOAuthScope('botAppId', [{type: 'aud', value: 'botAppId'}, {type: 'azp', value: 'botAppId'}]));

        const govAdapter = new BotFrameworkAdapter({ channelService: GovernmentConstants.ChannelService });
        // Missing botAppId
        assert.strictEqual(GovernmentConstants.ToChannelFromBotOAuthScope, await govAdapter.getOAuthScope(''));
        
        // Empty Claims
        assert.strictEqual(GovernmentConstants.ToChannelFromBotOAuthScope, await govAdapter.getOAuthScope('botAppId', []));
        
        // Non-skill Claims
        assert.strictEqual(GovernmentConstants.ToChannelFromBotOAuthScope, await govAdapter.getOAuthScope('botAppId', [{type: 'aud', value: 'botAppId'}, {type: 'azp', value: 'botAppId'}]));
    });

    describe('continueConversation', function() {
        it(`should succeed.`, function (done) {
            let called = false;
            const adapter = new AdapterUnderTest();
            adapter.continueConversation(reference, (context) => {
                assert(context, `context not passed.`);
                assert(context.activity, `context has no request.`);
                assert(context.activity.type === 'event', `request has invalid type.`);
                assert(context.activity.from && context.activity.from.id === reference.user.id, `request has invalid from.id.`);
                assert(context.activity.recipient && context.activity.recipient.id === reference.bot.id, `request has invalid recipient.id.`);
                called = true;
            }).then(() => {
                assert(called, `bot logic not called.`);
                done();
            });
        });

        it(`should not trust reference.serviceUrl if there is no AppId on the credentials.`, function (done) {
            let called = false;
            const adapter = new AdapterUnderTest();
            adapter.continueConversation(reference, (context) => {
                assert(context, `context not passed.`);
                assert(context.activity, `context has no request.`);
                assert(context.activity.type === 'event', `request has invalid type.`);
                assert(context.activity.from && context.activity.from.id === reference.user.id, `request has invalid from.id.`);
                assert(context.activity.recipient && context.activity.recipient.id === reference.bot.id, `request has invalid recipient.id.`);
                assert(!MicrosoftAppCredentials.isTrustedServiceUrl('https://example.org/channel'));
                called = true;
            }).then(() => {
                assert(called, `bot logic not called.`);
                done();
            });
        });

        it(`should trust reference.serviceUrl if there is an AppId on the credentials.`, function (done) {
            let called = false;
            const adapter = new AdapterUnderTest({ appId: '2id', appPassword: '2pw' });
            adapter.continueConversation(reference, (context) => {
                assert(context, `context not passed.`);
                assert(context.activity, `context has no request.`);
                assert(context.activity.type === 'event', `request has invalid type.`);
                assert(context.activity.from && context.activity.from.id === reference.user.id, `request has invalid from.id.`);
                assert(context.activity.recipient && context.activity.recipient.id === reference.bot.id, `request has invalid recipient.id.`);
                assert(MicrosoftAppCredentials.isTrustedServiceUrl('https://example.org/channel'));
                called = true;
            }).then(() => {
                assert(called, `bot logic not called.`);
                done();
            });
        });

        it(`should work with oAuthScope and logic passed in.`, async () => {
            let called = false;
            const adapter = new AdapterUnderTest();
            // Change the adapter's credentials' oAuthScope value.
            const testOAuthScope = 'TestTest';
            adapter.credentials.oAuthScope = testOAuthScope;
            await adapter.continueConversation(reference, testOAuthScope, (context) => {
                assert(context, `context not passed.`);
                assert(context.activity, `context has no request.`);
                assert.strictEqual(context.activity.type, 'event');
                assert.strictEqual((context.activity.from && context.activity.from.id), reference.user.id);
                assert.strictEqual((context.activity.recipient && context.activity.recipient.id), reference.bot.id);
                assert.strictEqual(context.turnState.get(context.adapter.OAuthScopeKey), testOAuthScope);
                called = true;
            });
            assert(called, `bot logic not called.`);
        });

        it(`should work with Gov cloud and only logic passed in.`, async () => {
            let called = false;
            const adapter = new AdapterUnderTest({ channelService: GovernmentConstants.ChannelService });
            await adapter.continueConversation(reference, (context) => {
                assert(context, `context not passed.`);
                assert(context.activity, `context has no request.`);
                assert.strictEqual(context.activity.type, 'event');
                assert.strictEqual((context.activity.from && context.activity.from.id), reference.user.id);
                assert.strictEqual((context.activity.recipient && context.activity.recipient.id), reference.bot.id);
                assert.strictEqual(context.turnState.get(context.adapter.OAuthScopeKey), GovernmentConstants.ToChannelFromBotOAuthScope);
                called = true;
            });
            assert(called, `bot logic not called.`);
        });
    });
});
