const assert = require('assert');
const nock = require('nock');
const os = require('os');
const pjson = require('../package.json');
const sinon = require('sinon');
const { BotFrameworkAdapter } = require('../');
const { Conversations } = require('botframework-connector/lib/connectorApi/operations');
const { UserToken, BotSignIn } = require('botframework-connector/lib/tokenApi/operations');
const { userAgentPolicy, HttpHeaders } = require('@azure/ms-rest-js');

const {
    ActivityHandler,
    ActivityTypes,
    CallerIdConstants,
    Channels,
    DeliveryModes,
    StatusCodes,
    TurnContext,
} = require('botbuilder-core');

const connector = require('botframework-connector');

const {
    AuthenticationConstants,
    CertificateAppCredentials,
    ClaimsIdentity,
    ConnectorClient,
    GovernmentConstants,
    JwtTokenValidation,
    MicrosoftAppCredentials,
    ChannelValidation,
    GovernmentChannelValidation,
} = require('botframework-connector');

const reference = {
    activityId: '1234',
    channelId: 'test',
    serviceUrl: 'https://example.org/channel',
    user: { id: 'user', name: 'User Name' },
    bot: { id: 'bot', name: 'Bot Name' },
    conversation: {
        id: 'convo1',
        properties: {
            foo: 'bar',
        },
    },
};

const incomingMessage = TurnContext.applyConversationReference({ text: 'test', type: 'message' }, reference, true);
const outgoingMessage = TurnContext.applyConversationReference({ text: 'test', type: 'message' }, reference);
const incomingInvoke = TurnContext.applyConversationReference({ type: 'invoke' }, reference, true);

const testTraceMessage = {
    type: 'trace',
    name: 'TestTrace',
    valueType: 'https://example.org/test/trace',
    label: 'Test Trace',
};

class AdapterUnderTest extends BotFrameworkAdapter {
    constructor(settings, { failAuth = false, failOperation = false, expectAuthHeader = '', newServiceUrl } = {}) {
        super(settings);
        this.failAuth = failAuth;
        this.failOperation = failOperation;
        this.expectAuthHeader = expectAuthHeader;
        this.newServiceUrl = newServiceUrl;
    }

    getOAuthScope() {
        return this.credentials.oAuthScope;
    }

    async testAuthenticateRequest(request, authHeader) {
        const claims = await super.authenticateRequestInternal(request, authHeader);
        if (!claims.isAuthenticated) {
            throw new Error('Unauthorized Access. Request is not authorized');
        }
    }

    testCreateConnectorClient(serviceUrl) {
        return super.createConnectorClient(serviceUrl);
    }

    authenticateRequest(request, authHeader) {
        return this.authenticateRequestInternal.bind(this)(request, authHeader);
    }

    authenticateRequestInternal(request, authHeader) {
        assert(request, `authenticateRequestInternal() not passed request.`);
        assert.strictEqual(
            authHeader,
            this.expectAuthHeader,
            `authenticateRequestInternal() not passed expected authHeader.`
        );
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
                    return this.failOperation
                        ? Promise.reject(new Error(`failed`))
                        : Promise.resolve({ id: 'convo2', serviceUrl: this.newServiceUrl });
                },
            },
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

    on() {
        assert.fail('unexpected call to request.on()');
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
        assert.notStrictEqual(this.statusCode, undefined, `response.end() called before response.send().`);
        this.ended = true;
    }
}

class MockConnector extends ConnectorClient {
    constructor(conversations) {
        super(new MicrosoftAppCredentials('', ''));
        this.conversations = conversations;
    }
}

function assertResponse(res, statusCode, hasBody) {
    assert(res.ended, 'response not ended.');
    assert.strictEqual(res.statusCode, statusCode);
    if (hasBody) {
        assert(res.body, 'response missing body.');
    } else {
        assert.strictEqual(res.body, undefined);
    }
}

function createActivity() {
    const account1 = {
        id: 'ChannelAccount_Id_1',
        name: 'ChannelAccount_Name_1',
        role: 'ChannelAccount_Role_1',
    };

    const account2 = {
        id: 'ChannelAccount_Id_2',
        name: 'ChannelAccount_Name_2',
        role: 'ChannelAccount_Role_2',
    };

    const conversationAccount = {
        conversationType: 'a',
        id: '123',
        isGroup: true,
        name: 'Name',
        role: 'ConversationAccount_Role',
    };

    return {
        id: '123',
        from: account1,
        recipient: account2,
        conversation: conversationAccount,
        channelId: 'ChannelId123',
        locale: 'en-uS', // Intentionally oddly-cased to check that it isn't defaulted somewhere, but tests stay in English
        serviceUrl: 'ServiceUrl123',
    };
}

async function assertRejectsWithMessage(promise, expectedMessage) {
    try {
        await promise;
    } catch (err) {
        assert(err instanceof Error);
        assert.strictEqual(err.message, expectedMessage);
        return;
    }

    assert.fail('did not reject');
}

describe('BotFrameworkAdapter', () => {
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    const mockReturns = (obj, method, returns) => sandbox.mock(obj).expects(method).returns(returns).once();

    const mockResponse = (obj, method, status = 200, parsedBody) =>
        mockReturns(obj, method, { _response: { status, parsedBody } });

    const processActivity = async (logic, { activity = incomingMessage, adapterArgs, testAdapterArgs } = {}) => {
        const request = new MockRequest(activity);
        const response = new MockResponse();

        const adapter = new AdapterUnderTest(adapterArgs, testAdapterArgs);
        const fake = sandbox.fake(logic);

        try {
            await adapter.processActivity(request, response, fake);
            return { fake, response, verify: () => assert(fake.called, 'bot logic not called') };
        } catch (err) {
            err.fake = fake;
            err.response = response;
            throw err;
        }
    };

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
                appPassword,
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
            assert.strictEqual(adapter.settings.channelService, 'https://botframework.azure.us');
            assert.strictEqual(adapter.settings.openIdMetadata, 'https://someEndpoint.com');

            delete process.env.ChannelService;
            delete process.env.BotOpenIdMetadata;
        });

        it(`should read webSocketFactory from the settings if it exists`, function () {
            const adapter = new AdapterUnderTest({ webSocketFactory: 'test-web-socket' });
            assert.strictEqual(
                adapter.webSocketFactory,
                'test-web-socket',
                `Adapter should have read settings.webSocketFactory`
            );
        });
    });

    describe('authenticateRequest()', () => {
        it(`should work if no appId or appPassword.`, async () => {
            mockReturns(JwtTokenValidation, 'authenticateRequest', new ClaimsIdentity([], true));

            const req = new MockRequest(incomingMessage);
            const adapter = new AdapterUnderTest();

            await adapter.testAuthenticateRequest(req, '');

            sandbox.verify();
        });

        it('should work if no appId or appPassword and discard callerId', async () => {
            mockReturns(JwtTokenValidation, 'authenticateRequest', new ClaimsIdentity([], true));

            // Create activity with callerId
            const incoming = TurnContext.applyConversationReference(
                { type: 'message', text: 'foo', callerId: 'foo' },
                reference,
                true
            );
            incoming.channelId = 'msteams';

            // Create Adapter, stub and spy for indirectly called methods
            const adapter = new BotFrameworkAdapter();

            await adapter.authenticateRequest(incoming, 'authHeader');
            assert.strictEqual(incoming.callerId, undefined);

            sandbox.verify();
        });

        it('should stamp over received callerId', async () => {
            mockReturns(JwtTokenValidation, 'authenticateRequest', new ClaimsIdentity([], true));

            // Create activity with callerId
            const incoming = TurnContext.applyConversationReference(
                { type: 'message', text: 'foo', callerId: 'foo' },
                reference,
                true
            );
            incoming.channelId = 'msteams';

            // Create Adapter, stub and spy for indirectly called methods
            const adapter = new BotFrameworkAdapter();
            mockReturns(adapter.credentialsProvider, 'isAuthenticationDisabled', Promise.resolve(false));

            await adapter.authenticateRequest(incoming, 'authHeader');
            assert.strictEqual(incoming.callerId, CallerIdConstants.PublicAzureChannel);

            sandbox.verify();
        });

        it(`should fail if appId+appPassword and no headers.`, async () => {
            const req = new MockRequest(incomingMessage);
            const adapter = new AdapterUnderTest({ appId: 'bogusApp', appPassword: 'bogusPassword' });
            await assertRejectsWithMessage(
                adapter.testAuthenticateRequest(req, ''),
                'Unauthorized Access. Request is not authorized'
            );
        });
    });

    describe('buildCredentials()', () => {
        it('should return credentials with correct parameters', async () => {
            const adapter = new BotFrameworkAdapter({ appId: 'appId', appPassword: 'appPassword' });
            const creds = await adapter.buildCredentials('appId', 'scope');
            assert.strictEqual(creds.appId, 'appId');
            assert.strictEqual(creds.appPassword, 'appPassword');
            assert.strictEqual(creds.oAuthScope, 'scope');
        });

        it('should return credentials with default public Azure values', async () => {
            const adapter = new BotFrameworkAdapter({ appId: 'appId', appPassword: 'appPassword' });
            const creds = await adapter.buildCredentials('appId');
            assert.strictEqual(creds.appId, 'appId');
            assert.strictEqual(creds.appPassword, 'appPassword');
            assert.strictEqual(creds.oAuthScope, AuthenticationConstants.ToBotFromChannelTokenIssuer);

            const oAuthEndpoint =
                AuthenticationConstants.ToChannelFromBotLoginUrlPrefix +
                AuthenticationConstants.DefaultChannelAuthTenant;
            assert.strictEqual(creds.oAuthEndpoint, oAuthEndpoint);
        });
    });

    describe('get/create ConnectorClient methods', () => {
        it(`should createConnectorClient().`, function () {
            const adapter = new AdapterUnderTest();
            const client = adapter.testCreateConnectorClient(reference.serviceUrl);
            assert(client, `client not returned.`);
            assert(client.conversations, `invalid client returned.`);
        });

        it('getOrCreateConnectorClient should create a new client if the cached serviceUrl does not match the provided one', () => {
            const adapter = new BotFrameworkAdapter();
            const context = new TurnContext(adapter, {
                type: ActivityTypes.Message,
                text: 'hello',
                serviceUrl: 'http://bing.com',
            });
            const cc = new ConnectorClient(new MicrosoftAppCredentials('', ''), { baseUri: 'http://bing.com' });
            context.turnState.set(adapter.ConnectorClientKey, cc);

            const client = adapter.getOrCreateConnectorClient(context, 'https://botframework.com', adapter.credentials);
            assert.notStrictEqual(client.baseUri, cc.baseUri);
        });

        it('ConnectorClient should add userAgent header from clientOptions', async () => {
            const userAgent = 'test user agent';

            nock(reference.serviceUrl)
                .matchHeader('user-agent', (val) => val.endsWith(userAgent))
                .post('/v3/conversations/convo1/activities/1234')
                .reply(200, { id: 'abc123id' });

            const adapter = new BotFrameworkAdapter({ clientOptions: { userAgent } });

            await adapter.continueConversation(reference, async (turnContext) => {
                await turnContext.sendActivity(outgoingMessage);
            });
        });

        it('ConnectorClient should use httpClient from clientOptions', async () => {
            const outgoingMessageLocale = JSON.parse(JSON.stringify(outgoingMessage));
            outgoingMessageLocale.locale = 'en-uS'; // Intentionally oddly-cased to check that it isn't defaulted somewhere, but tests stay in English

            const sendRequest = sandbox.fake((request) =>
                Promise.resolve({
                    request,
                    status: 200,
                    headers: new HttpHeaders(),
                    readableStreamBody: undefined,
                    bodyAsText: '',
                })
            );

            const adapter = new BotFrameworkAdapter({ clientOptions: { httpClient: { sendRequest } } });

            const referenceWithLocale = JSON.parse(JSON.stringify(reference));
            referenceWithLocale.locale = 'en-uS'; // Intentionally oddly-cased to check that it isn't defaulted somewhere, but tests stay in English

            await adapter.continueConversation(referenceWithLocale, async (turnContext) => {
                await turnContext.sendActivity(outgoingMessage);
            });

            assert(
                sendRequest.called,
                'sendRequest on HttpClient provided to BotFrameworkAdapter.clientOptions was not called when sending an activity'
            );

            const [request] = sendRequest.args[0];
            assert.deepStrictEqual(
                JSON.parse(request.body),
                outgoingMessageLocale,
                'sentActivity should flow through custom httpClient.sendRequest'
            );
        });

        it('ConnectorClient should use requestPolicyFactories from clientOptions', async () => {
            const setUserAgent = userAgentPolicy({ value: 'test' });
            const factories = [setUserAgent];

            const adapter = new BotFrameworkAdapter({ clientOptions: { requestPolicyFactories: factories } });

            await adapter.continueConversation(reference, async (turnContext) => {
                const connectorClient = turnContext.turnState.get(turnContext.adapter.ConnectorClientKey);

                assert(
                    connectorClient._requestPolicyFactories.find((policy) => policy === setUserAgent),
                    'requestPolicyFactories from clientOptions parameter is not used.'
                );
            });
        });

        it('createConnectorClientWithIdentity should throw without identity', async () => {
            const adapter = new BotFrameworkAdapter();
            await assertRejectsWithMessage(
                adapter.createConnectorClientWithIdentity('https://serviceurl.com'),
                'BotFrameworkAdapter.createConnectorClientWithIdentity(): invalid identity parameter.'
            );
        });

        it('createConnectorClientWithIdentity should use valid passed-in audience', async () => {
            const adapter = new BotFrameworkAdapter();
            const appId = '00000000-0000-0000-0000-000000000001';
            const serviceUrl = 'https://serviceurl.com';
            const audience = 'not-a-bot-or-channel';
            const identity = new ClaimsIdentity([
                { type: AuthenticationConstants.AudienceClaim, value: appId },
                { type: AuthenticationConstants.VersionClaim, value: '2.0' },
            ]);

            sandbox.mock(adapter).expects('getOAuthScope').never();

            sandbox
                .mock(adapter)
                .expects('buildCredentials')
                .callsFake((appId, oAuthScope) =>
                    Promise.resolve(new MicrosoftAppCredentials(appId, '', undefined, oAuthScope))
                )
                .once();

            const client = await adapter.createConnectorClientWithIdentity(serviceUrl, identity, audience);

            sandbox.verify();

            assert.strictEqual(client.credentials.appId, appId);
            assert.strictEqual(client.credentials.oAuthScope, audience);
        });

        it('createConnectorClientWithIdentity should use claims with invalid audience', async () => {
            const adapter = new BotFrameworkAdapter();
            const appId = '00000000-0000-0000-0000-000000000001';
            const skillAppId = '00000000-0000-0000-0000-000000000002';
            const serviceUrl = 'https://serviceurl.com';
            const audience = ' ';

            const identity = new ClaimsIdentity([
                { type: AuthenticationConstants.AudienceClaim, value: appId },
                { type: AuthenticationConstants.VersionClaim, value: '2.0' },
                { type: AuthenticationConstants.AuthorizedParty, value: skillAppId },
            ]);

            sandbox.mock(adapter).expects('getOAuthScope').withArgs(appId, identity.claims).once().callThrough();

            sandbox
                .mock(adapter)
                .expects('buildCredentials')
                .callsFake((appId, oAuthScope) =>
                    Promise.resolve(new MicrosoftAppCredentials(appId, '', undefined, oAuthScope))
                )
                .once();

            const client = await adapter.createConnectorClientWithIdentity(serviceUrl, identity, audience);

            sandbox.verify();

            assert.strictEqual(client.credentials.appId, appId);
            assert.strictEqual(client.credentials.oAuthScope, skillAppId);
        });

        it('createConnectorClientWithIdentity should use credentials.oAuthScope with bad invalid audience and non-skill claims', async () => {
            const adapter = new BotFrameworkAdapter();
            const appId = '00000000-0000-0000-0000-000000000001';
            const serviceUrl = 'https://serviceurl.com';
            const audience = ' ';

            const identity = new ClaimsIdentity([
                { type: AuthenticationConstants.AudienceClaim, value: appId },
                { type: AuthenticationConstants.VersionClaim, value: '2.0' },
            ]);

            sandbox.mock(adapter).expects('getOAuthScope').once().callThrough();

            sandbox
                .mock(adapter)
                .expects('buildCredentials')
                .callsFake((appId, oAuthScope) =>
                    Promise.resolve(new MicrosoftAppCredentials(appId, '', undefined, oAuthScope))
                )
                .once();

            const client = await adapter.createConnectorClientWithIdentity(serviceUrl, identity, audience);

            sandbox.verify();

            assert.strictEqual(client.credentials.appId, appId);
            assert.strictEqual(client.credentials.oAuthScope, AuthenticationConstants.ToChannelFromBotOAuthScope);
        });

        it(`createConnectorClientWithIdentity should create a ConnectorClient with CertificateAppCredentials when certificateThumbprint and certificatePrivatekey are provided`, async () => {
            const appId = '01234567-4242-aaaa-bbbb-cccccccccccc';
            const certificatePrivateKey = 'key';
            const certificateThumbprint = 'thumbprint';
            const adapter = new BotFrameworkAdapter({ appId, certificatePrivateKey, certificateThumbprint });

            const connector = await adapter.createConnectorClientWithIdentity(
                'https://serviceurl.com',
                new ClaimsIdentity([
                    { type: AuthenticationConstants.AppIdClaim, value: appId },
                ])
            );
            const credentials = connector.credentials;

            assert(credentials instanceof CertificateAppCredentials);
            assert.strictEqual(credentials.appId, appId);
            assert.strictEqual(credentials.certificatePrivateKey, certificatePrivateKey);
            assert.strictEqual(credentials.certificateThumbprint, certificateThumbprint);
        });

        it(`createConnectorClientWithIdentity should create a ConnectorClient with MicrosoftAppCredentials when certificateThumbprint and certificatePrivatekey are absent and ClaimsIdenity has AppIdClaim`, async () => {
            const appId = '01234567-4242-aaaa-bbbb-cccccccccccc';
            const appPassword = 'password123';
            const adapter = new BotFrameworkAdapter({ appId, appPassword });

            const connector = await adapter.createConnectorClientWithIdentity(
                'https://serviceurl.com',
                new ClaimsIdentity([
                    { type: AuthenticationConstants.AppIdClaim, value: appId }
                ]
            ));

            const credentials = connector.credentials;

            assert(credentials instanceof MicrosoftAppCredentials);
            assert.strictEqual(credentials.appId, appId);
            assert.strictEqual(credentials.certificatePrivateKey, undefined);
            assert.strictEqual(credentials.certificateThumbprint, undefined);
        });

        it(`createConnectorClientWithIdentity should create a ConnectorClient with MicrosoftAppCredentials when certificateThumbprint and certificatePrivatekey are absent and ClaimsIdenity has AudienceClaim`, async () => {
            const appId = '01234567-4242-aaaa-bbbb-cccccccccccc';
            const appPassword = 'password123';
            const adapter = new BotFrameworkAdapter({ appId, appPassword });

            const connector = await adapter.createConnectorClientWithIdentity(
                'https://serviceurl.com',
                new ClaimsIdentity([
                    { type: AuthenticationConstants.AudienceClaim, value: appId }
                ]
            ));

            const credentials = connector.credentials;

            assert(credentials instanceof MicrosoftAppCredentials);
            assert.strictEqual(credentials.appId, appId);
            assert.strictEqual(credentials.certificatePrivateKey, undefined);
            assert.strictEqual(credentials.certificateThumbprint, undefined);
        });
    });

    it(`processActivity() should respect expectReplies if it's set via logic`, async () => {
        const { response, verify } = await processActivity(async (context) => {
            context.activity.deliveryMode = 'expectReplies';
            await context.sendActivity({ type: 'message', text: 'Hello Buffered World!' });
        });

        assertResponse(response, StatusCodes.OK, true);
        verify();
    });

    it(`processActivity() should send only bufferedActivities when both expectReplies and invoke are set`, async () => {
        const activity = {
            ...JSON.parse(JSON.stringify(incomingMessage)),
            type: ActivityTypes.Invoke,
            deliveryMode: DeliveryModes.ExpectReplies,
        };

        const { response, verify } = await processActivity(
            async (context) => {
                await context.sendActivity({ type: 'invokeResponse', text: '1st message' });
                await context.sendActivity({ type: 'invokeResponse', text: '2nd message' });
            },
            { activity }
        );

        assertResponse(response, StatusCodes.OK, true);
        verify();

        assert.deepStrictEqual(
            response.body.activities.map(({ text, type }) => ({ text, type })),
            [
                {
                    text: '1st message',
                    type: 'invokeResponse',
                },
                {
                    text: '2nd message',
                    type: 'invokeResponse',
                },
            ]
        );
    });

    it(`should remove trace activities from bufferedReplyActivities if request.channelId !== Channels.Emulator`, async () => {
        const activity = {
            ...JSON.parse(JSON.stringify(incomingMessage)),
            type: ActivityTypes.Invoke,
            deliveryMode: DeliveryModes.ExpectReplies,
            channelId: Channels.Msteams,
        };

        const { response, verify } = await processActivity(
            async (context) => {
                await context.sendActivity({ type: 'invokeResponse', text: 'message' });
                await context.sendActivity(testTraceMessage);
            },
            { activity }
        );

        assertResponse(response, StatusCodes.OK, true);
        verify();

        assert.deepStrictEqual(
            response.body.activities.map(({ text, type }) => ({ text, type })),
            [
                {
                    text: 'message',
                    type: 'invokeResponse',
                },
            ]
        );
    });

    it(`should keep trace activities from bufferedReplyActivities if request.channelId === Channels.Emulator`, async () => {
        const activity = {
            ...JSON.parse(JSON.stringify(incomingMessage)),
            type: ActivityTypes.Invoke,
            deliveryMode: DeliveryModes.ExpectReplies,
            channelId: Channels.Emulator,
        };

        const { response, verify } = await processActivity(
            async (context) => {
                await context.sendActivity({ type: 'invokeResponse', text: 'message' });
                await context.sendActivity(testTraceMessage);
            },
            { activity }
        );

        assertResponse(response, StatusCodes.OK, true);
        verify();

        assert.deepStrictEqual(
            response.body.activities.map(({ type }) => type),
            ['invokeResponse', 'trace']
        );
    });

    it(`processActivity() should not respect invokeResponses if the incoming request wasn't of type "invoke"`, async () => {
        const { response, verify } = await processActivity(async (context) => {
            await context.sendActivity({ type: 'invokeResponse', text: 'InvokeResponse Test' });
        });

        assertResponse(response, StatusCodes.OK, false);
        verify();
    });

    it(`should processActivity().`, async () => {
        const { response, verify } = await processActivity((context) => {
            assert(context, `context not passed.`);
        });

        assertResponse(response, StatusCodes.OK);
        verify();
    });

    it(`should processActivity() sent as body.`, async () => {
        const { response, verify } = await processActivity((context) => {
            assert(context, `context not passed.`);
        });

        assertResponse(response, StatusCodes.OK);
        verify();
    });

    it(`should check timestamp in processActivity() sent as body.`, async () => {
        const activity = {
            ...incomingMessage,
            timestamp: '2018-10-01T14:14:54.790Z',
            localTimestamp: '2018-10-01T14:14:54.790Z',
        };

        const { response, verify } = await processActivity(
            (context) => {
                assert(context, `context not passed.`);

                assert.strictEqual(
                    typeof context.activity.timestamp,
                    'object',
                    `'context.activity.timestamp' is not a date`
                );

                assert(context.activity.timestamp instanceof Date, `'context.activity.timestamp' is not a date`);

                assert.strictEqual(
                    typeof context.activity.localTimestamp,
                    'object',
                    `'context.activity.localTimestamp' is not a date`
                );

                assert(
                    context.activity.localTimestamp instanceof Date,
                    `'context.activity.localTimestamp' is not a date`
                );
            },
            { activity }
        );

        assertResponse(response, StatusCodes.OK);
        verify();
    });

    it(`should reject a bogus request sent to processActivity().`, async () => {
        try {
            await processActivity(() => null, { activity: 'bogus' });
        } catch (err) {
            assert(err);

            const { fake, response } = err;
            assert(!fake.called);
            assertResponse(response, 400, true);

            return;
        }

        assert.fail('should have thrown');
    });

    it(`should reject a request without activity type sent to processActivity().`, async () => {
        try {
            await processActivity(() => null, { activity: { text: 'foo' } });
        } catch (err) {
            assert(err);

            const { fake, response } = err;
            assert(!fake.called);
            assertResponse(response, 400, true);

            return;
        }

        assert.fail('should have thrown');
    });

    it(`should migrate location of tenantId for MS Teams processActivity().`, async () => {
        const activity = TurnContext.applyConversationReference(
            { type: 'message', text: 'foo', channelData: { tenant: { id: '1234' } } },
            reference,
            true
        );
        activity.channelId = 'msteams';

        const { response, verify } = await processActivity(
            (context) => {
                assert.strictEqual(
                    context.activity.conversation.tenantId,
                    '1234',
                    `should have copied tenant id from channelData to conversation address`
                );
            },
            { activity }
        );

        assertResponse(response, StatusCodes.OK);
        verify();
    });

    it(`receive a semanticAction with a state property on the activity in processActivity().`, async () => {
        const activity = TurnContext.applyConversationReference(
            { type: 'message', text: 'foo', semanticAction: { state: 'start' } },
            reference,
            true
        );
        activity.channelId = 'msteams';

        const { response, verify } = await processActivity(
            (context) => {
                assert(context.activity.semanticAction.state === 'start');
            },
            { activity }
        );

        assertResponse(response, StatusCodes.OK);
        verify();
    });

    describe('callerId generation', function () {
        const processIncoming = async (
            incoming,
            handler,
            { adapterArgs = {}, authDisabled = false, claims = [] } = {}
        ) => {
            // Sets up expectation for JWT validation to pass back claims
            mockReturns(JwtTokenValidation, 'authenticateRequest', new ClaimsIdentity(claims, true));

            const adapter = new BotFrameworkAdapter(adapterArgs);

            // Sets up expectation for whether auth is enabled or disabled
            mockReturns(adapter.credentialsProvider, 'isAuthenticationDisabled', Promise.resolve(authDisabled));

            // Ensures that generateCalledId is invoked
            sandbox.mock(adapter).expects('generateCallerId').once().callThrough();

            // Construct the things, invoke processActivity
            const fake = sandbox.fake(handler);
            const req = new MockBodyRequest(incoming);
            const res = new MockResponse();
            await adapter.processActivity(req, res, fake);

            // Ensure expectations were met and handler was called
            sandbox.verify();
            assertResponse(res, StatusCodes.OK);
            assert(fake.called, 'bot handler was not called');
        };

        it(`should ignore received and generate callerId on parsed activity in processActivity()`, async () => {
            const incoming = TurnContext.applyConversationReference(
                { type: 'message', text: 'foo', callerId: 'foo' },
                reference,
                true
            );
            incoming.channelId = 'msteams';

            await processIncoming(incoming, (context) => {
                assert.strictEqual(context.activity.callerId, CallerIdConstants.PublicAzureChannel);
            });
        });

        it(`should generate a skill callerId property on the activity in processActivity()`, async () => {
            const skillAppId = '00000000-0000-0000-0000-000000000000';
            const skillConsumerAppId = '00000000-0000-0000-0000-000000000001';

            const incoming = TurnContext.applyConversationReference({ type: 'message', text: 'foo' }, reference, true);
            incoming.channelId = 'msteams';

            await processIncoming(
                incoming,
                (context) => {
                    assert.strictEqual(
                        context.activity.callerId,
                        `${CallerIdConstants.BotToBotPrefix}${skillConsumerAppId}`
                    );
                },
                {
                    claims: [
                        { type: AuthenticationConstants.AudienceClaim, value: skillAppId },
                        { type: AuthenticationConstants.AppIdClaim, value: skillConsumerAppId },
                        { type: AuthenticationConstants.VersionClaim, value: '1.0' },
                    ],
                }
            );
        });

        it(`should discard & not generate callerId on the parsed activity with disabledAuth`, async () => {
            const incoming = TurnContext.applyConversationReference(
                { type: 'message', text: 'foo', callerId: 'foo' },
                reference,
                true
            );
            incoming.channelId = 'msteams';

            await processIncoming(
                incoming,
                (context) => {
                    assert.strictEqual(context.activity.callerId, undefined);
                },
                { authDisabled: true }
            );
        });

        it(`should generate a US Gov cloud callerId property on the activity in processActivity()`, async () => {
            const skillAppId = '00000000-0000-0000-0000-000000000000';

            const incoming = TurnContext.applyConversationReference({ type: 'message', text: 'foo' }, reference, true);
            incoming.channelId = 'directline';

            await processIncoming(
                incoming,
                (context) => {
                    assert.strictEqual(context.activity.callerId, CallerIdConstants.USGovChannel);
                },
                {
                    adapterArgs: { channelService: GovernmentConstants.ChannelService },
                    claims: [
                        { type: AuthenticationConstants.AudienceClaim, value: skillAppId },
                        { type: AuthenticationConstants.VersionClaim, value: '1.0' },
                    ],
                }
            );
        });
    });

    it(`should receive a properties property on the conversation object in processActivity().`, async () => {
        const incoming = TurnContext.applyConversationReference(
            { type: 'message', text: 'foo', callerId: 'foo' },
            reference,
            true
        );
        incoming.channelId = 'msteams';

        const { response, verify } = await processActivity((context) => {
            assert(context.activity.conversation.properties.foo === 'bar');
        }, incoming);

        assertResponse(response, StatusCodes.OK);
        verify();
    });

    it(`should fail to auth on call to processActivity().`, async () => {
        try {
            await processActivity(() => null, { testAdapterArgs: { failAuth: true } });
        } catch (err) {
            const { fake, response } = err;
            assertResponse(response, 401, true);
            assert(!fake.called);

            return;
        }

        assert.fail('should have thrown');
    });

    it(`should return 500 error on bot logic exception during processActivity().`, async () => {
        try {
            await processActivity(() => {
                throw new Error('bot exception');
            });
        } catch (err) {
            const { fake, response } = err;
            assertResponse(response, 500, true);
            assert(fake.called);

            return;
        }

        assert.fail('should have thrown');
    });

    describe('createConversation()', () => {
        const createConversation = async (
            reference,
            handler,
            { adapterArgs, createConversationParams, testAdapterArgs } = {}
        ) => {
            const adapter = new AdapterUnderTest(adapterArgs, testAdapterArgs);

            const fake = sandbox.fake(handler);

            try {
                await adapter.createConversation(reference, createConversationParams, fake);
            } catch (err) {
                err.fake = fake;
                throw err;
            }

            sandbox.verify();
            assert(fake.called);
        };

        it(`should createConversation().`, async () => {
            await createConversation(reference, (context) => {
                assert(context, `context not passed.`);
                assert(context.activity, `context has no request.`);
                assert.strictEqual(context.activity.conversation.id, 'convo2', `request has invalid conversation.id.`);
            });
        });

        it(`should createConversation() with parameters.`, async () => {
            await createConversation(
                reference,
                (context) => {
                    assert(context, `context not passed.`);
                    assert(context.activity, `context has no request.`);
                    assert(context.activity.conversation, `activity has no conversation`);
                    assert(context.activity.conversation.isGroup, `activity isGroup is not true`);
                },
                { createConversationParams: { isGroup: true } }
            );
        });

        it(`should createConversation() and assign new serviceUrl.`, async () => {
            await createConversation(
                reference,
                (context) => {
                    assert(context, `context not passed.`);
                    assert(context.activity, `context has no request.`);
                    assert.strictEqual(
                        context.activity.conversation.id,
                        'convo2',
                        `request has invalid conversation.id.`
                    );
                    assert.strictEqual(
                        context.activity.serviceUrl,
                        'https://example.org/channel2',
                        `request has invalid conversation.id.`
                    );
                },
                {
                    testAdapterArgs: { newServiceUrl: 'https://example.org/channel2' },
                }
            );
        });

        it(`should fail to createConversation() if serviceUrl missing.`, async () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { serviceUrl, ...bogusReference } = Object.assign({}, reference);

            try {
                await createConversation(bogusReference, () => null);
            } catch (err) {
                const { fake } = err;
                assert(!fake.called);

                return;
            }

            assert.fail('should have thrown');
        });

        it(`should createConversation() for Teams.`, async () => {
            const tenantReference = {
                ...reference,
                channelId: 'msteams',
                conversation: { ...reference.conversation, tenantId: 'tenantId' },
            };

            await createConversation(tenantReference, (context) => {
                assert(context, `context not passed.`);
                assert(context.activity, `context has no request.`);
                assert(context.activity.conversation, `request has invalid conversation.`);

                assert.strictEqual(context.activity.conversation.id, 'convo2', `request has invalid conversation.id.`);

                assert.strictEqual(
                    context.activity.conversation.tenantId,
                    tenantReference.conversation.tenantId,
                    `request has invalid tenantId on conversation.`
                );

                assert.strictEqual(
                    context.activity.channelData.tenant.id,
                    tenantReference.conversation.tenantId,
                    `request has invalid tenantId in channelData.`
                );
            });
        });
    });

    describe('sendActivities()', () => {
        it(`should deliver a single activity using sendActivities().`, async () => {
            const adapter = new AdapterUnderTest();
            const context = new TurnContext(adapter, incomingMessage);
            const responses = await adapter.sendActivities(context, [outgoingMessage]);
            assert.deepStrictEqual(
                responses.map(({ id }) => id),
                ['5678']
            );
        });

        it(`should deliver multiple activities using sendActivities().`, async () => {
            const adapter = new AdapterUnderTest();
            const context = new TurnContext(adapter, incomingMessage);
            const responses = await adapter.sendActivities(context, [outgoingMessage, outgoingMessage]);
            assert(responses.length === 2, `invalid number of responses returned.`);
        });

        describe('with delay', function () {
            this.timeout(1500);

            it(`should wait for a 'delay' using sendActivities().`, async () => {
                const start = new Date().getTime();
                const adapter = new AdapterUnderTest();
                const context = new TurnContext(adapter, incomingMessage);

                const responses = await adapter.sendActivities(context, [
                    outgoingMessage,
                    { type: 'delay', value: 600 },
                    outgoingMessage,
                ]);

                const end = new Date().getTime();

                assert(responses.length === 3, `invalid number of responses returned.`);
                assert(end - start >= 500, `didn't pause for delay.`);
            });

            it(`should wait for a 'delay' withut a value using sendActivities().`, async () => {
                const start = new Date().getTime();
                const adapter = new AdapterUnderTest();
                const context = new TurnContext(adapter, incomingMessage);

                const responses = await adapter.sendActivities(context, [
                    outgoingMessage,
                    { type: 'delay' },
                    outgoingMessage,
                ]);

                const end = new Date().getTime();

                assert(responses.length === 3, `invalid number of responses returned.`);
                assert(end - start >= 500, `didn't pause for delay.`);
            });
        });
    });

    it(`should return bots invokeResponse`, async () => {
        const { response, verify } = await processActivity(
            (context) => context.sendActivity({ type: 'invokeResponse', value: { status: 200, body: 'body' } }),
            { activity: incomingInvoke }
        );
        assertResponse(response, StatusCodes.OK, true);
        verify();
    });

    it(`should return 501 error if bot fails to return an 'invokeResponse'.`, async () => {
        try {
            await processActivity(() => undefined, { activity: incomingInvoke });
        } catch (err) {
            const { fake, response } = err;
            assertResponse(response, 501, false);
            assert(fake.called);

            return;
        }

        assert.fail('should have thrown');
    });

    it(`should fail to sendActivities().`, async () => {
        const adapter = new AdapterUnderTest(undefined, { failOperation: true });
        const context = new TurnContext(adapter, incomingMessage);
        const copy = Object.assign({}, outgoingMessage);
        await assert.rejects(adapter.sendActivities(context, [copy]));
    });

    it(`should fail to sendActivities() without a serviceUrl.`, async () => {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const copy = Object.assign({}, outgoingMessage, { serviceUrl: undefined });
        await assert.rejects(adapter.sendActivities(context, [copy]));
    });

    it(`should fail to sendActivities() without a conversation.id.`, async () => {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const copy = Object.assign({}, outgoingMessage, { conversation: undefined });
        await assert.rejects(adapter.sendActivities(context, [copy]));
    });

    it(`should post to a whole conversation using sendActivities() if replyToId missing.`, async () => {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const copy = Object.assign({}, outgoingMessage, { replyToId: undefined });
        const responses = await adapter.sendActivities(context, [copy]);
        assert.deepStrictEqual(
            responses.map(({ id }) => id),
            ['5678']
        );
    });

    it(`should updateActivity().`, async () => {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const result = await adapter.updateActivity(context, incomingMessage);
        assert.deepStrictEqual(result, { id: '5678' }, 'result is expected');
    });

    it(`should fail to updateActivity() if serviceUrl missing.`, async () => {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const copy = Object.assign({}, incomingMessage, { serviceUrl: undefined });
        await assert.rejects(adapter.updateActivity(context, copy));
    });

    it(`should fail to updateActivity() if conversation missing.`, async () => {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const copy = Object.assign({}, incomingMessage, { conversation: undefined });
        await assert.rejects(adapter.updateActivity(context, copy));
    });

    it(`should fail to updateActivity() if activity.id missing.`, async () => {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const copy = Object.assign({}, incomingMessage, { id: undefined });
        await assert.rejects(adapter.updateActivity(context, copy));
    });

    it(`should deleteActivity().`, async () => {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        await adapter.deleteActivity(context, reference);
    });

    it(`should fail to deleteActivity() if serviceUrl missing.`, async () => {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const copy = Object.assign({}, reference, { serviceUrl: undefined });
        await assert.rejects(adapter.deleteActivity(context, copy));
    });

    it(`should fail to deleteActivity() if conversation missing.`, async () => {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const copy = Object.assign({}, reference, { conversation: undefined });
        await assert.rejects(adapter.deleteActivity(context, copy));
    });

    it(`should fail to deleteActivity() if activityId missing.`, async () => {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const copy = Object.assign({}, reference, { activityId: undefined });
        await assert.rejects(adapter.deleteActivity(context, copy));
    });

    const userAgent = `Microsoft-BotFramework/3.1 BotBuilder/${pjson.version} (Node.js,Version=${
        process.version
    }; ${os.type()} ${os.release()}; ${os.arch()})`;

    it(`should create a User-Agent header with the same info as the host machine.`, async () => {
        nock(reference.serviceUrl)
            .matchHeader('user-agent', (val) => val.endsWith(userAgent))
            .post('/v3/conversations/convo1/activities/1234')
            .reply(200, { id: 'abc123id' });

        const adapter = new BotFrameworkAdapter();

        await adapter.continueConversation(reference, async (turnContext) => {
            await turnContext.sendActivity(outgoingMessage);
        });
    });

    it(`should still add Botbuilder User-Agent header when custom requestPolicyFactories are provided.`, async () => {
        nock(reference.serviceUrl)
            .matchHeader('user-agent', (val) => val.endsWith(userAgent))
            .post('/v3/conversations/convo1/activities/1234')
            .reply(200, { id: 'abc123id' });

        const adapter = new BotFrameworkAdapter({ clientOptions: { requestPolicyFactories: [] } });

        await adapter.continueConversation(reference, async (turnContext) => {
            await turnContext.sendActivity(outgoingMessage);
        });
    });

    describe('ChannelValidation and GovernmentChannelValidation', () => {
        const channelValidationOidMetadataEndpoint = ChannelValidation.OpenIdMetadataEndpoint;
        const govChannelValidationOidMetadataEndpoint = GovernmentChannelValidation.OpenIdMetadataEndpoint;

        afterEach(() => {
            connector.ChannelValidation.OpenIdMetadataEndpoint = channelValidationOidMetadataEndpoint;
            connector.GovernmentChannelValidation.OpenIdMetadataEndpoint = govChannelValidationOidMetadataEndpoint;
        });

        it(`should set openIdMetadata property on ChannelValidation`, () => {
            const testEndpoint = 'http://rainbows.com';

            new BotFrameworkAdapter({ openIdMetadata: testEndpoint });

            assert.strictEqual(
                testEndpoint,
                connector.ChannelValidation.OpenIdMetadataEndpoint,
                `ChannelValidation.OpenIdMetadataEndpoint was not set.`
            );
        });

        it(`should set openIdMetadata property on GovernmentChannelValidation`, () => {
            const testEndpoint = 'http://azure.com/configuration';
            new BotFrameworkAdapter({ openIdMetadata: testEndpoint });

            assert.strictEqual(
                testEndpoint,
                connector.GovernmentChannelValidation.OpenIdMetadataEndpoint,
                `GovernmentChannelValidation.OpenIdMetadataEndpoint was not set.`
            );
        });
    });

    it(`should set oAuthEndpoint property on connector client`, () => {
        const testEndpoint = 'http://rainbows.com';
        const adapter = new BotFrameworkAdapter({ oAuthEndpoint: testEndpoint });
        const url = adapter.oauthApiUrl();
        assert.strictEqual(testEndpoint, url, `adapter.oauthApiUrl is incorrect.`);
    });

    it(`should throw error if missing serviceUrl in deleteConversationMember()`, async () => {
        const adapter = new AdapterUnderTest();
        await assertRejectsWithMessage(
            adapter.deleteConversationMember({ activity: {} }),
            'BotFrameworkAdapter.deleteConversationMember(): missing serviceUrl'
        );
    });

    it(`should throw error if missing conversation in deleteConversationMember()`, async () => {
        const adapter = new AdapterUnderTest();
        await assertRejectsWithMessage(
            adapter.deleteConversationMember({ activity: { serviceUrl: 'https://test.com' } }),
            'BotFrameworkAdapter.deleteConversationMember(): missing conversation or conversation.id'
        );
    });

    it(`should throw error if missing conversation.id in deleteConversationMember()`, async () => {
        const adapter = new AdapterUnderTest();
        await assertRejectsWithMessage(
            adapter.deleteConversationMember({ activity: { serviceUrl: 'https://test.com', conversation: {} } }),
            'BotFrameworkAdapter.deleteConversationMember(): missing conversation or conversation.id'
        );
    });

    it(`should call client.conversations deleteConversationMember()`, async () => {
        const conversations = new Conversations({ id: 'convo1' });
        mockResponse(conversations, 'deleteConversationMember', 200);

        const connector = new MockConnector(conversations);
        const adapter = new BotFrameworkAdapter();
        mockReturns(adapter, 'getOrCreateConnectorClient', connector);

        await adapter.deleteConversationMember(
            { activity: { serviceUrl: 'https://test.com', conversation: { id: 'convo1' } } },
            'test-member'
        );

        sandbox.verify();
    });

    it(`should throw error if missing serviceUrl in getActivityMembers()`, async () => {
        const adapter = new AdapterUnderTest();
        await assertRejectsWithMessage(
            adapter.getActivityMembers({ activity: {} }),
            'BotFrameworkAdapter.getActivityMembers(): missing serviceUrl'
        );
    });

    it(`should throw error if missing conversation in getActivityMembers()`, async () => {
        const adapter = new AdapterUnderTest();
        await assertRejectsWithMessage(
            adapter.getActivityMembers({ activity: { serviceUrl: 'https://test.com' } }),
            'BotFrameworkAdapter.getActivityMembers(): missing conversation or conversation.id'
        );
    });

    it(`should throw error if missing conversation.id in getActivityMembers()`, async () => {
        const adapter = new AdapterUnderTest();
        await assertRejectsWithMessage(
            adapter.getActivityMembers({ activity: { serviceUrl: 'https://test.com', conversation: {} } }),
            'BotFrameworkAdapter.getActivityMembers(): missing conversation or conversation.id'
        );
    });

    it(`should throw error if missing activityId in getActivityMembers()`, async () => {
        const adapter = new AdapterUnderTest();
        await assertRejectsWithMessage(
            adapter.getActivityMembers({
                activity: { serviceUrl: 'https://test.com', conversation: { id: '1' } },
            }),
            'BotFrameworkAdapter.getActivityMembers(): missing both activityId and context.activity.id'
        );
    });

    it(`should call client.conversations getActivityMembers()`, async () => {
        const conversations = new Conversations({ id: 'convo1' });
        mockResponse(conversations, 'getActivityMembers', 200);

        const connector = new MockConnector(conversations);

        const adapter = new BotFrameworkAdapter();
        mockReturns(adapter, 'getOrCreateConnectorClient', connector);

        await adapter.getActivityMembers(
            { activity: { serviceUrl: 'https://test.com', conversation: { id: 'convo1' } } },
            'activityId'
        );

        sandbox.verify();
    });

    it(`should throw error if missing serviceUrl in getConversationMembers()`, async () => {
        const adapter = new AdapterUnderTest();
        await assertRejectsWithMessage(
            adapter.getConversationMembers({ activity: {} }),
            'BotFrameworkAdapter.getConversationMembers(): missing serviceUrl'
        );
    });

    it(`should throw error if missing conversation in getConversationMembers()`, async () => {
        const adapter = new AdapterUnderTest();
        await assertRejectsWithMessage(
            adapter.getConversationMembers({ activity: { serviceUrl: 'https://test.com' } }),
            'BotFrameworkAdapter.getConversationMembers(): missing conversation or conversation.id'
        );
    });

    it(`should throw error if missing conversation.id in getConversationMembers()`, async () => {
        const adapter = new AdapterUnderTest();
        await assertRejectsWithMessage(
            adapter.getConversationMembers({ activity: { serviceUrl: 'https://test.com', conversation: {} } }),
            'BotFrameworkAdapter.getConversationMembers(): missing conversation or conversation.id'
        );
    });

    it(`should call client.conversations getConversationMembers()`, async () => {
        const conversations = new Conversations({ id: 'convo1' });
        mockResponse(conversations, 'getConversationMembers', 200);

        const connector = new MockConnector(conversations);
        const adapter = new BotFrameworkAdapter();
        mockReturns(adapter, 'getOrCreateConnectorClient', connector);

        await adapter.getConversationMembers({
            activity: { serviceUrl: 'https://test.com', conversation: { id: 'convo1' } },
        });

        sandbox.verify();
    });

    it(`should throw error if missing from in getUserToken()`, async () => {
        const adapter = new AdapterUnderTest();
        await assertRejectsWithMessage(
            adapter.getUserToken({ activity: {}, turnState: new Map() }),
            'BotFrameworkAdapter.getUserToken(): missing from or from.id'
        );
    });

    it(`should throw error if missing from.id in getUserToken()`, async () => {
        const adapter = new AdapterUnderTest();
        await assertRejectsWithMessage(
            adapter.getUserToken({ activity: { from: {} }, turnState: new Map() }),
            'BotFrameworkAdapter.getUserToken(): missing from or from.id'
        );
    });

    it(`should throw error if missing connectionName`, async () => {
        const adapter = new AdapterUnderTest();
        await assertRejectsWithMessage(
            adapter.getUserToken({ activity: { from: { id: 'some id' } }, turnState: new Map() }),
            'getUserToken() requires a connectionName but none was provided.'
        );
    });

    it(`should get the user token when all params are provided`, async () => {
        const expectedToken = { token: 'yay! a token!', _response: { status: 200 } };
        const getToken = sandbox.fake(() => Promise.resolve(expectedToken));

        const adapter = new AdapterUnderTest();
        mockReturns(adapter, 'createTokenApiClient', { userToken: { getToken } });

        const token = await adapter.getUserToken(
            { activity: { channelId: 'The Facebook', from: { id: 'some id' } }, turnState: new Map() },
            'aConnectionName'
        );

        sandbox.verify();
        assert(getToken.called);

        assert.deepStrictEqual(token, expectedToken);

        const [id, connection, channelData] = getToken.args[0];
        assert.strictEqual(id, 'some id');
        assert.strictEqual(connection, 'aConnectionName');
        assert.deepStrictEqual(channelData, { channelId: 'The Facebook', code: undefined });
    });

    it(`should throw error if missing from in signOutUser()`, async () => {
        const adapter = new AdapterUnderTest();
        await assertRejectsWithMessage(
            adapter.signOutUser({ activity: {}, turnState: new Map() }),
            'BotFrameworkAdapter.signOutUser(): missing from or from.id'
        );
    });

    it(`should throw error if missing from.id in signOutUser()`, async () => {
        const adapter = new AdapterUnderTest();
        await assertRejectsWithMessage(
            adapter.signOutUser({ activity: { from: {} }, turnState: new Map() }),
            'BotFrameworkAdapter.signOutUser(): missing from or from.id'
        );
    });

    it(`should call client.userToken signOut()`, async () => {
        const userToken = new UserToken('token');
        mockResponse(userToken, 'signOut', 200);

        const adapter = new BotFrameworkAdapter();
        mockReturns(adapter, 'createTokenApiClient', { userToken });

        const context = new TurnContext(adapter, createActivity());
        await adapter.signOutUser(context);

        sandbox.verify();
    });

    it(`should throw error if missing from in getAadTokens()`, async () => {
        const adapter = new AdapterUnderTest();
        await assertRejectsWithMessage(
            adapter.getAadTokens({ activity: {}, turnState: new Map() }),
            'BotFrameworkAdapter.getAadTokens(): missing from or from.id'
        );
    });

    it(`should throw error if missing from.id in getAadTokens()`, async () => {
        const adapter = new AdapterUnderTest();
        await assertRejectsWithMessage(
            adapter.getAadTokens({ activity: { from: {} }, turnState: new Map() }),
            'BotFrameworkAdapter.getAadTokens(): missing from or from.id'
        );
    });

    it(`should call client.userToken getAadTokens()`, async () => {
        const userToken = new UserToken('token');
        mockResponse(userToken, 'getAadTokens', 200);

        const adapter = new BotFrameworkAdapter();
        mockReturns(adapter, 'createTokenApiClient', { userToken });

        const context = new TurnContext(adapter, createActivity());
        await adapter.getAadTokens(context);

        sandbox.verify();
    });

    describe('getSignInLink()', () => {
        const mockedUrl = 'http://mockedurl.com';

        const getMockedAdapter = () => {
            const credentials = new MicrosoftAppCredentials('abc', 'abc');

            const getSignInUrl = sandbox.fake(() => Promise.resolve({ _response: { bodyAsText: mockedUrl } }));

            const adapter = new BotFrameworkAdapter();
            mockReturns(adapter, 'createTokenApiClient', { credentials, botSignIn: { getSignInUrl } });

            const context = new TurnContext(adapter, incomingMessage);

            return {
                adapter,
                context,
                verify: () => {
                    sandbox.verify();
                    assert(getSignInUrl.called);
                },
            };
        };

        it(`should throw if userName != from.id`, async () => {
            const { adapter, context } = getMockedAdapter();

            await assertRejectsWithMessage(
                adapter.getSignInLink(
                    context,
                    'aConnectionName',
                    new MicrosoftAppCredentials('abc', 'abc'),
                    'invalidId'
                ),
                `cannot retrieve OAuth signin link for a user that's different from the conversation`
            );
        });

        it(`should return return a sign-in URL with context and connectionName`, async () => {
            const { adapter, context, verify } = getMockedAdapter();
            const response = await adapter.getSignInLink(context, 'aConnectionName');
            assert(response, mockedUrl);
            verify();
        });

        it(`should return return a sign-in URL with context connectionName, oauthAppCredentials`, async () => {
            const { adapter, context, verify } = getMockedAdapter();
            const response = await adapter.getSignInLink(
                context,
                'aConnectionName',
                new MicrosoftAppCredentials('abc', 'abc')
            );
            assert(response, mockedUrl);
            verify();
        });

        it(`should return return a sign-in URL with context connectionName, oauthAppCredentials, userId, finalRedirect`, async () => {
            const { adapter, context, verify } = getMockedAdapter();
            const response = await adapter.getSignInLink(
                context,
                'aConnectionName',
                new MicrosoftAppCredentials('abc', 'abc'),
                incomingMessage.from.id,
                'http://finalredirect.com'
            );
            assert(response, mockedUrl);
            verify();
        });
    });

    describe('getSignInResource()', () => {
        const getMockedAdapter = (incomingMessage = createActivity()) => {
            const botSignIn = new BotSignIn('botSignIn');
            mockResponse(botSignIn, 'getSignInResource', 200);

            const adapter = new BotFrameworkAdapter();
            mockReturns(adapter, 'createTokenApiClient', {
                botSignIn,
                credentials: new MicrosoftAppCredentials('appId', 'appPassword'),
            });

            const context = new TurnContext(adapter, incomingMessage);

            return {
                adapter,
                context,
                verify: () => sandbox.verify(),
            };
        };

        it(`should throw error if missingConnectionName in getSignInResource`, async () => {
            const { adapter, context } = getMockedAdapter();
            await assertRejectsWithMessage(
                adapter.getSignInResource(context),
                `getUserToken() requires a connectionName but none was provided.`
            );
        });

        it(`should throw error if missing Activity.from in getSignInResource`, async () => {
            const activity = createActivity();
            activity.from = undefined;

            const { adapter, context } = getMockedAdapter(activity);
            await assertRejectsWithMessage(
                adapter.getSignInResource(context, 'TestConnectionName'),
                `BotFrameworkAdapter.getSignInResource(): missing from or from.id`
            );
        });

        it(`should throw error if missing Activity.from.id in getSignInResource`, async () => {
            const activity = createActivity();
            activity.from.id = undefined;

            const { adapter, context } = getMockedAdapter(activity);
            await assertRejectsWithMessage(
                adapter.getSignInResource(context, 'TestConnectionName'),
                `BotFrameworkAdapter.getSignInResource(): missing from or from.id`
            );
        });

        it(`should throw error if userId does not match Activity.from.id in getSignInResource`, async () => {
            const { adapter, context } = getMockedAdapter();
            await assertRejectsWithMessage(
                adapter.getSignInResource(context, 'TestConnectionName', 'OtherUserId'),
                'BotFrameworkAdapter.getSiginInResource(): cannot get signin resource for a user that is different from the conversation'
            );
        });

        it(`should call client.botSignIn getSignInResource()`, async () => {
            const { adapter, context, verify } = getMockedAdapter();
            await adapter.getSignInResource(context, 'TestConnectionName', 'ChannelAccount_Id_1');
            verify();
        });
    });

    describe('exchangeToken()', () => {
        const getMockedAdapter = (incomingMessage = createActivity()) => {
            const userToken = new UserToken('token');
            mockResponse(userToken, 'exchangeAsync', 200);

            const adapter = new BotFrameworkAdapter();
            mockReturns(adapter, 'createTokenApiClient', { userToken });

            const context = new TurnContext(adapter, incomingMessage);

            return { adapter, context, verify: () => sandbox.verify() };
        };

        it(`should throw error if missing ConnectionName in exchangeToken`, async () => {
            const { adapter, context } = getMockedAdapter();
            await assertRejectsWithMessage(
                adapter.exchangeToken(context),
                `exchangeToken() requires a connectionName but none was provided.`
            );
        });

        it(`should throw error if missing userId in exchangeToken`, async () => {
            const { adapter, context } = getMockedAdapter();
            await assertRejectsWithMessage(
                adapter.exchangeToken(context, 'TestConnectionName'),
                `exchangeToken() requires an userId but none was provided.`
            );
        });

        it(`should throw error if missing Uri and Token properties of TokenExchangeRequest in exchangeToken`, async () => {
            const { adapter, context } = getMockedAdapter();
            await assertRejectsWithMessage(
                adapter.exchangeToken(context, 'TestConnectionName', 'TestUser', {}),
                `BotFrameworkAdapter.exchangeToken(): Either a Token or Uri property is required on the TokenExchangeRequest`
            );
        });

        it(`should call client.userToken exchangeAsync()`, async () => {
            const { adapter, context, verify } = getMockedAdapter();
            await adapter.exchangeToken(context, 'TestConnectionName', 'userId', { uri: 'http://test' });
            verify();
        });
    });

    describe('getTokenStatus()', () => {
        const getMockedAdapter = (incomingMessage = createActivity()) => {
            const tokenStatus = {
                channelId: 'mockChannel',
                connectionName: 'mockConnectionName',
                hasToken: true,
                serviceProviderDisplayName: 'mockDisplayName',
            };

            const userToken = new UserToken('token');
            mockResponse(userToken, 'getTokenStatus', 200, [tokenStatus]);

            const adapter = new BotFrameworkAdapter();
            mockReturns(adapter, 'createTokenApiClient', { userToken });

            const context = new TurnContext(adapter, incomingMessage);

            return { adapter, context, tokenStatus, verify: () => sandbox.verify() };
        };

        it(`should return the status of every connection the user has`, async () => {
            const { adapter, context, tokenStatus, verify } = getMockedAdapter();
            const responses = await adapter.getTokenStatus(context, 'userId');
            verify();
            assert.deepStrictEqual(responses, [tokenStatus]);
        });

        it(`should call client.userToken getTokenStatus()`, async () => {
            const { adapter, context, verify } = getMockedAdapter();
            await adapter.getTokenStatus(context, 'userId');
            verify();
        });

        it(`should throw error if missing from in getTokenStatus()`, async () => {
            const adapter = new AdapterUnderTest();
            await assertRejectsWithMessage(
                adapter.getTokenStatus({ activity: {}, turnState: new Map() }),
                'BotFrameworkAdapter.getTokenStatus(): missing from or from.id'
            );
        });

        it(`should throw error if missing from.id in getTokenStatus()`, async () => {
            const adapter = new AdapterUnderTest();
            await assertRejectsWithMessage(
                adapter.getTokenStatus({ activity: { from: {} }, turnState: new Map() }),
                'BotFrameworkAdapter.getTokenStatus(): missing from or from.id'
            );
        });
    });

    it('getOAuthScope', async () => {
        const adapter = new BotFrameworkAdapter({});
        // Missing botAppId
        assert.strictEqual(AuthenticationConstants.ToChannelFromBotOAuthScope, await adapter.getOAuthScope());

        // Empty Claims
        assert.strictEqual(
            AuthenticationConstants.ToChannelFromBotOAuthScope,
            await adapter.getOAuthScope('botAppId', [])
        );

        // Non-skill Claims
        assert.strictEqual(
            AuthenticationConstants.ToChannelFromBotOAuthScope,
            await adapter.getOAuthScope('botAppId', [
                { type: 'aud', value: 'botAppId' },
                { type: 'azp', value: 'botAppId' },
            ])
        );

        const govAdapter = new BotFrameworkAdapter({ channelService: GovernmentConstants.ChannelService });
        // Missing botAppId
        assert.strictEqual(GovernmentConstants.ToChannelFromBotOAuthScope, await govAdapter.getOAuthScope(''));

        // Empty Claims
        assert.strictEqual(
            GovernmentConstants.ToChannelFromBotOAuthScope,
            await govAdapter.getOAuthScope('botAppId', [])
        );

        // Non-skill Claims
        assert.strictEqual(
            GovernmentConstants.ToChannelFromBotOAuthScope,
            await govAdapter.getOAuthScope('botAppId', [
                { type: 'aud', value: 'botAppId' },
                { type: 'azp', value: 'botAppId' },
            ])
        );
    });

    describe('continueConversation', () => {
        const continueConversation = async (reference, handler, { adapterArgs, testAdapterArgs, oauthScope } = {}) => {
            const fake = sandbox.fake(handler);

            const adapter = new AdapterUnderTest(adapterArgs, testAdapterArgs);

            if (oauthScope) {
                adapter.credentials.oauthScope = oauthScope;
                await adapter.continueConversation(reference, oauthScope, fake);
            } else {
                await adapter.continueConversation(reference, fake);
            }

            sandbox.verify();
            assert(fake.called);
        };

        it(`should succeed.`, async () => {
            await continueConversation(reference, (context) => {
                assert(context, `context not passed.`);
                assert(context.activity, `context has no request.`);
                assert.strictEqual(context.activity.type, 'event', `request has invalid type.`);
                assert.strictEqual(context.activity.from.id, reference.user.id, `request has invalid from.id.`);
                assert.strictEqual(
                    context.activity.recipient.id,
                    reference.bot.id,
                    `request has invalid recipient.id.`
                );
            });
        });

        it(`should not trust reference.serviceUrl if there is no AppId on the credentials.`, async () => {
            await continueConversation(reference, (context) => {
                assert(context, `context not passed.`);
                assert(context.activity, `context has no request.`);
                assert.strictEqual(context.activity.type, 'event', `request has invalid type.`);
                assert.strictEqual(context.activity.from.id, reference.user.id, `request has invalid from.id.`);
                assert.strictEqual(
                    context.activity.recipient.id,
                    reference.bot.id,
                    `request has invalid recipient.id.`
                );
            });
        });

        it(`should trust reference.serviceUrl if there is an AppId on the credentials.`, async () => {
            await continueConversation(reference, (context) => {
                assert(context, `context not passed.`);
                assert(context.activity, `context has no request.`);
                assert.strictEqual(context.activity.type, 'event', `request has invalid type.`);
                assert.strictEqual(context.activity.from.id, reference.user.id, `request has invalid from.id.`);
                assert.strictEqual(
                    context.activity.recipient.id,
                    reference.bot.id,
                    `request has invalid recipient.id.`
                );
            });
        });

        it(`should work with oAuthScope and logic passed in.`, async () => {
            const oauthScope = 'TestTest';

            await continueConversation(
                reference,
                (context) => {
                    assert(context, `context not passed.`);
                    assert(context.activity, `context has no request.`);
                    assert.strictEqual(context.activity.type, 'event');
                    assert.strictEqual(context.activity.from.id, reference.user.id);
                    assert.strictEqual(context.activity.recipient.id, reference.bot.id);
                    assert.strictEqual(context.turnState.get(context.adapter.OAuthScopeKey), oauthScope);
                },
                { oauthScope }
            );
        });

        it(`should work with Gov cloud and only logic passed in.`, async () => {
            await continueConversation(
                reference,
                (context) => {
                    assert(context, `context not passed.`);
                    assert(context.activity, `context has no request.`);

                    assert.strictEqual(context.activity.type, 'event');
                    assert.strictEqual(context.activity.from.id, reference.user.id);
                    assert.strictEqual(context.activity.recipient.id, reference.bot.id);

                    assert.strictEqual(
                        context.turnState.get(context.adapter.OAuthScopeKey),
                        GovernmentConstants.ToChannelFromBotOAuthScope
                    );
                },
                {
                    adapterArgs: { channelService: GovernmentConstants.ChannelService },
                }
            );
        });
    });

    describe('getConversations', () => {
        it(`should throw error if missing serviceUrl parameter in getConversations()`, async () => {
            const adapter = new AdapterUnderTest();
            await assertRejectsWithMessage(
                adapter.getConversations(),
                'createConnectorClient() not passed serviceUrl.'
            );
        });

        it(`should throw error if missing Activity.serviceUrl in getConversations()`, async () => {
            const adapter = new AdapterUnderTest();
            await assertRejectsWithMessage(
                adapter.getConversations({ activity: {} }),
                'createConnectorClient() not passed serviceUrl.'
            );
        });

        it(`should call client.conversations getConversations after getOrCreateConnectorClient`, async () => {
            const conversations = new Conversations({ id: 'convo1' });
            mockResponse(conversations, 'getConversations', 200);

            const connector = new MockConnector(conversations);

            const adapter = new BotFrameworkAdapter();
            mockReturns(adapter, 'getOrCreateConnectorClient', connector);

            await adapter.getConversations({
                activity: { serviceUrl: 'https://test.com', conversation: { id: 'convo1' } },
            });

            sandbox.verify();
        });

        it(`should call client.conversations getConversations after createConnectorClient`, async () => {
            const conversations = new Conversations({ id: 'convo1' });
            mockResponse(conversations, 'getConversations', 200);

            const connector = new MockConnector(conversations);

            const adapter = new BotFrameworkAdapter();
            mockReturns(adapter, 'createConnectorClient', connector);

            await adapter.getConversations('test-context');

            sandbox.verify();
        });
    });

    describe('processActivityDirect', () => {
        it(`should throw error with stack when runMiddleware() fails`, async () => {
            const adapter = new BotFrameworkAdapter();
            sandbox.stub(adapter, 'runMiddleware').throws({ stack: 'test-error' });

            await assertRejectsWithMessage(
                adapter.processActivityDirect(createActivity(), () => null),
                'BotFrameworkAdapter.processActivityDirect(): ERROR\n test-error'
            );

            sandbox.verify();
        });

        it(`should throw generic error when runMiddleware() fails`, async () => {
            const adapter = new BotFrameworkAdapter();
            sandbox.stub(adapter, 'runMiddleware').throws({ message: 'test-error' });

            await assertRejectsWithMessage(
                adapter.processActivityDirect(createActivity(), 'callbackLogic'),
                'BotFrameworkAdapter.processActivityDirect(): ERROR'
            );

            sandbox.verify();
        });
    });
});
