// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const httpMocks = require('node-mocks-http');
const net = require('net');
const { expect } = require('chai');
const sinon = require('sinon');
const {
    AuthenticationConfiguration,
    BotFrameworkAuthenticationFactory,
    allowedCallersClaimsValidator,
} = require('botframework-connector');
const {
    CloudAdapter,
    ConfigurationServiceClientCredentialFactory,
    ActivityTypes,
    createBotFrameworkAuthenticationFromConfiguration,
    INVOKE_RESPONSE_KEY,
} = require('..');
const { NamedPipeServer } = require('botframework-streaming');
const { StatusCodes } = require('botframework-schema');

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
            const authorization = 'Bearer Authorization';
            const activity = { type: ActivityTypes.Invoke, value: 'invoke' };

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
            const consoleSpy = sinon.spy(console, 'error');

            // Expired token with removed AppID
            const authorization =
                'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjJaUXBKM1VwYmpBWVhZR2FYRUpsOGxWMFRPSSIsImtpZCI6IjJaUXBKM1VwYmpBWVhZR2FYRUpsOGxWMFRPSSJ9.eyJhdWQiOiJodHRwczovL2FwaS5ib3RmcmFtZXdvcmsuY29tIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvZDZkNDk0MjAtZjM5Yi00ZGY3LWExZGMtZDU5YTkzNTg3MWRiLyIsImlhdCI6MTY3MDM1MDQxNSwibmJmIjoxNjcwMzUwNDE1LCJleHAiOjE2NzA0MzcxMTUsImFpbyI6IkUyWmdZTkJONEpWZmxlOTJUc2wxYjhtOHBjOWpBQT09IiwiYXBwaWQiOiI5ZGRmM2QwZS02ZDRlLTQ2MWEtYjM4Yi0zMTYzZWQ3Yjg1NmIiLCJhcHBpZGFjciI6IjEiLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9kNmQ0OTQyMC1mMzliLTRkZjctYTFkYy1kNTlhOTM1ODcxZGIvIiwicmgiOiIwLkFXNEFJSlRVMXB2ejkwMmgzTldhazFoeDIwSXpMWTBwejFsSmxYY09EcS05RnJ4dUFBQS4iLCJ0aWQiOiJkNmQ0OTQyMC1mMzliLTRkZjctYTFkYy1kNTlhOTM1ODcxZGIiLCJ1dGkiOiJIWDlncld2bU1rMlhESTRkS3BHSEFBIiwidmVyIjoiMS4wIn0.PBLuja5sCcDfFjweoy-VucvbfHEyEcs1GyqXjekzBqgvK-mSc1UrEfqr5834qY6dLNsXVIMJzMFuH6WyPbnAfIfRcabdiVSOAl8N8e9Tex6vHfPi4h4P2F96VkXU80EtZX4QMjsJMDJ5eXbJlIDEAxXoJbAdHqgy-lHcVBx8XK7toJ_W7vSsFhis3C4CPCHI1cf1WuHVwfFXBiNwsOzj9cnRUKpea6UELV89q4C0L6aeSNdWYXehZmgq-wlo2wIaGgQ7rOXx4MlIrc83LBzMMc6TWvBJecK6O8pJWLe6BTwOltBI8Tmo2hWnY1OnsbOhbSSlfwLaZqKI7QpA50_2GQ';

            const activity = { type: ActivityTypes.Invoke, value: 'invoke' };

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

            const validTokenIssuers = [];
            const claimsValidators = allowedCallersClaimsValidator(['*']);
            const authConfig = new AuthenticationConfiguration([], claimsValidators, validTokenIssuers);
            const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
                MicrosoftAppId: '',
                MicrosoftAppPassword: '',
                MicrosoftAppType: '',
                MicrosoftAppTenantId: '',
            });

            const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(
                null,
                credentialsFactory,
                authConfig,
                undefined,
                undefined
            );

            const adapter = new CloudAdapter(botFrameworkAuthentication);

            await adapter.process(req, res, logic);

            assert.equal(StatusCodes.UNAUTHORIZED, res.statusCode);
            expect(consoleSpy.calledWithMatch({ message: 'The token has expired' })).to.be.true;
        });
    });

    describe('connectNamedPipe', function () {
        it('throws for bad args', async function () {
            const includesParam = (param) => (err) => {
                assert(err.message.includes(`at ${param}`), err.message);
                return true;
            };

            await assert.rejects(
                adapter.connectNamedPipe(undefined, noop, 'appId', 'audience', 'callerId'),
                includesParam('pipeName')
            );

            await assert.rejects(
                adapter.connectNamedPipe('pipeName', undefined, 'appId', 'audience', 'callerId'),
                includesParam('logic')
            );

            await assert.rejects(
                adapter.connectNamedPipe('pipeName', noop, undefined, 'audience', 'callerId'),
                includesParam('appId')
            );

            await assert.rejects(
                adapter.connectNamedPipe('pipeName', noop, 'appId', undefined, 'callerId'),
                includesParam('audience')
            );

            await assert.rejects(
                adapter.connectNamedPipe('pipeName', noop, 'appId', 'audience', 10),
                includesParam('callerId')
            );
        });

        it('succeeds', async function () {
            sandbox.stub(NamedPipeServer.prototype, 'start').resolves();
            await adapter.connectNamedPipe('pipeName', noop, 'appId', 'audience');
        });
    });
});
