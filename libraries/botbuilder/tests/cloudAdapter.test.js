// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const httpMocks = require('node-mocks-http');
const net = require('net');
const { expect } = require('../vendors/chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const nock = require('nock');
const forge = require('node-forge');
const { generateKeyPairSync } = require('crypto');

const {
    AuthenticationConfiguration,
    AuthenticationConstants,
    BotFrameworkAuthenticationFactory,
    allowedCallersClaimsValidator,
} = require('botframework-connector');
const {
    CloudAdapter,
    ConfigurationBotFrameworkAuthentication,
    ConfigurationServiceClientCredentialFactory,
    ActivityTypes,
    createBotFrameworkAuthenticationFromConfiguration,
    INVOKE_RESPONSE_KEY,
} = require('..');
const { NamedPipeServer } = require('botframework-streaming');
const { StatusCodes } = require('botframework-schema');
const { CallerIdConstants } = require('../../botbuilder-core/lib/index');

const FakeBuffer = () => Buffer.from([]);
const FakeNodeSocket = () => new net.Socket();
const noop = () => null;

describe('CloudAdapter', function () {
    let sandbox;

    beforeEach(function () {
        sandbox = sinon.createSandbox({ useFakeTimers: false });
    });

    afterEach(function () {
        if (sandbox) {
            sandbox.restore();
        }
    });

    const adapter = new CloudAdapter();

    describe('constructor', function () {
        it('throws for bad args', function () {
            assert.throws(() => new CloudAdapter(null), {
                name: 'TypeError',
                message: '`botFrameworkAuthentication` parameter required',
            });
        });

        it('succeeds', function () {
            new CloudAdapter(BotFrameworkAuthenticationFactory.create());
            new CloudAdapter();
        });
    });

    describe('process', function () {
        class TestConfiguration {
            static DefaultConfig = {
                // [AuthenticationConstants.ChannelService]: undefined,
                ValidateAuthority: true,
                ToChannelFromBotLoginUrl: AuthenticationConstants.ToChannelFromBotLoginUrl,
                ToChannelFromBotOAuthScope: AuthenticationConstants.ToChannelFromBotOAuthScope,
                ToBotFromChannelTokenIssuer: AuthenticationConstants.ToBotFromChannelTokenIssuer,
                ToBotFromEmulatorOpenIdMetadataUrl: AuthenticationConstants.ToBotFromEmulatorOpenIdMetadataUrl,
                CallerId: CallerIdConstants.PublicAzureChannel,
                ToBotFromChannelOpenIdMetadataUrl: AuthenticationConstants.ToBotFromChannelOpenIdMetadataUrl,
                OAuthUrl: AuthenticationConstants.OAuthUrl,
                // [AuthenticationConstants.OAuthUrlKey]: 'test',
                [AuthenticationConstants.BotOpenIdMetadataKey]: null,
            };

            constructor(config = {}) {
                this.configuration = Object.assign({}, TestConfiguration.DefaultConfig, config);
            }

            get(_path) {
                return this.configuration;
            }

            set(_path, _val) {}
        }

        const activity = { type: ActivityTypes.Invoke, value: 'invoke' };
        const authorization = 'Bearer Authorization';

        it('delegates to connect', async function () {
            const req = {};
            const socket = FakeNodeSocket();
            const head = FakeBuffer();
            const logic = () => Promise.resolve();

            const mock = sandbox.mock(adapter);
            mock.expects('connect').withArgs(req, socket, head, logic).once().resolves();
            mock.expects('processActivity').never();

            await adapter.process(req, socket, head, logic);

            mock.verify();
        });

        it('delegates to processActivity', async function () {
            const req = httpMocks.createRequest({
                method: 'POST',
                headers: { authorization },
                body: activity,
            });

            const res = httpMocks.createResponse();

            const logic = async (context) => {
                context.turnState.set(INVOKE_RESPONSE_KEY, {
                    type: ActivityTypes.InvokeResponse,
                    value: {
                        status: 200,
                        body: 'invokeResponse',
                    },
                });
            };

            const mock = sandbox.mock(adapter);
            mock.expects('processActivity').withArgs(authorization, activity, logic).once().resolves();
            mock.expects('connect').never();

            await adapter.process(req, res, logic);

            mock.verify();
        });

        it('throws exception on expired token', async function () {
            const consoleStub = sandbox.stub(console, 'error');

            const { publicKey, privateKey } = generateKeyPairSync('rsa', {
                modulusLength: 2048, // Key length (in bits)
            });

            const fakeKid = uuidv4();
            const fakeTid = 'd6d49420-f39b-4df7-a1dc-d59a935871db';

            // Parse public key to get modulus and exponent
            const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' });
            const publicKeyForge = forge.pki.publicKeyFromPem(publicKeyPem);
            const modulus = Buffer.from(publicKeyForge.n.toByteArray()).toString('base64url');
            const exponent = Buffer.from(publicKeyForge.e.toByteArray()).toString('base64url');

            // Mock the request to get jwks_uri
            nock('https://login.microsoftonline.com').get('/common/v2.0/.well-known/openid-configuration').reply(200, {
                jwks_uri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
            });

            // Mock the request to the jwks_uri
            nock('https://login.microsoftonline.com')
                .get('/common/discovery/v2.0/keys')
                .reply(200, {
                    keys: [
                        {
                            kty: 'RSA',
                            use: 'sig',
                            kid: fakeKid,
                            e: exponent,
                            n: modulus,
                        },
                    ],
                });

            // Mock expired token
            const header = { alg: 'RS256', typ: 'JWT', kid: fakeKid };
            const payload = {
                aud: 'https://api.botframework.com',
                iss: `https://login.microsoftonline.com/${fakeTid}/v2.0`,
                iat: Math.floor(Date.now() / 1000) - 7200, // Issued 2 hours ago
                nbf: Math.floor(Date.now() / 1000) - 7200, // Not valid before 2 hours ago
                exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
                tid: fakeTid,
                ver: '2.0',
            };

            // Create the token using the secret key
            const token =
                'Bearer ' +
                jwt.sign(payload, privateKey.export({ type: 'pkcs1', format: 'pem' }), { header, algorithm: 'RS256' });

            const activity = { type: ActivityTypes.Invoke, value: 'invoke' };
            // Mock request and response
            const req = httpMocks.createRequest({
                method: 'POST',
                headers: { authorization: token },
                body: activity,
            });

            const res = httpMocks.createResponse();

            const logic = async (context) => {
                context.turnState.set(INVOKE_RESPONSE_KEY, {
                    type: ActivityTypes.InvokeResponse,
                    value: {
                        status: 200,
                        body: 'invokeResponse',
                    },
                });
            };

            const validTokenIssuers = [];
            const claimsValidators = allowedCallersClaimsValidator(['*']);
            const authConfig = new AuthenticationConfiguration([], claimsValidators, validTokenIssuers);
            const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
                MicrosoftAppId: 'app-id',
                MicrosoftAppPassword: 'app-password',
                MicrosoftAppType: '',
                MicrosoftAppTenantId: '',
            });

            const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(
                null,
                credentialsFactory,
                authConfig,
                undefined,
                undefined,
            );

            const adapter = new CloudAdapter(botFrameworkAuthentication);

            await adapter.process(req, res, logic);
            assert.equal(StatusCodes.UNAUTHORIZED, res.statusCode);
            expect(consoleStub.calledWithMatch({ message: 'The token has expired' })).to.equal(true);
        });

        it('calls processActivityDirect with string authorization', async function () {
            const logic = async (context) => {
                context.turnState.set(INVOKE_RESPONSE_KEY, {
                    type: ActivityTypes.InvokeResponse,
                    value: {
                        status: 200,
                        body: 'invokeResponse',
                    },
                });
            };

            const mock = sandbox.mock(adapter);
            mock.expects('processActivity').withArgs(authorization, activity, logic).once().resolves();
            mock.expects('connect').never();

            await adapter.processActivityDirect(authorization, activity, logic);

            mock.verify();
        });

        it('calls processActivityDirect with AuthenticateRequestResult authorization', async function () {
            const claimsIdentity = adapter.createClaimsIdentity('appId');
            const audience = AuthenticationConstants.ToChannelFromBotOAuthScope;
            const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
                TestConfiguration.DefaultConfig,
            );
            const connectorFactory = botFrameworkAuthentication.createConnectorFactory(claimsIdentity);
            //AuthenticateRequestResult
            const authentication = {
                audience: audience,
                claimsIdentity: claimsIdentity,
                callerId: 'callerdId',
                connectorFactory: connectorFactory,
            };
            const logic = async (context) => {
                context.turnState.set(INVOKE_RESPONSE_KEY, {
                    type: ActivityTypes.InvokeResponse,
                    value: {
                        status: 200,
                        body: 'invokeResponse',
                    },
                });
            };

            const mock = sandbox.mock(adapter);
            mock.expects('processActivity').withArgs(authentication, activity, logic).once().resolves();
            mock.expects('connect').never();

            await adapter.processActivityDirect(authentication, activity, logic);

            mock.verify();
        });

        it('calls processActivityDirect with error', async function () {
            const logic = async (context) => {
                context.turnState.set(INVOKE_RESPONSE_KEY, {
                    type: ActivityTypes.InvokeResponse,
                    value: {
                        status: 200,
                        body: 'invokeResponse',
                    },
                });
            };

            sandbox.stub(adapter, 'processActivity').throws({ stack: 'error stack' });

            await assert.rejects(
                adapter.processActivityDirect(authorization, activity, logic),
                new Error('CloudAdapter.processActivityDirect(): ERROR\n error stack'),
            );
        });
    });

    describe('connectNamedPipe', function () {
        it('throws for bad args', async function () {
            const includesParam = (param) => (err) => {
                assert(err.message.includes(`${param}`), err.message);
                return true;
            };

            await assert.rejects(
                adapter.connectNamedPipe(undefined, noop, 'appId', 'audience', 'callerId'),
                includesParam('pipeName'),
            );

            await assert.rejects(
                adapter.connectNamedPipe('pipeName', undefined, 'appId', 'audience', 'callerId'),
                includesParam('logic'),
            );

            await assert.rejects(
                adapter.connectNamedPipe('pipeName', noop, undefined, 'audience', 'callerId'),
                includesParam('appId'),
            );

            await assert.rejects(
                adapter.connectNamedPipe('pipeName', noop, 'appId', undefined, 'callerId'),
                includesParam('audience'),
            );

            await assert.rejects(
                adapter.connectNamedPipe('pipeName', noop, 'appId', 'audience', 10),
                includesParam('callerId'),
            );
        });

        it('succeeds', async function () {
            sandbox.stub(NamedPipeServer.prototype, 'start').resolves();
            await adapter.connectNamedPipe('pipeName', noop, 'appId', 'audience');
        });
    });
});
