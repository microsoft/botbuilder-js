// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const httpMocks = require('node-mocks-http');
const net = require('net');
const sinon = require('sinon');
const { BotFrameworkAuthenticationFactory } = require('botframework-connector');
const { CloudAdapter, ActivityTypes, INVOKE_RESPONSE_KEY } = require('..');
const { NamedPipeServer } = require('botframework-streaming');

const FakeBuffer = () => Buffer.from([]);
const FakeNodeSocket = () => new net.Socket();
const noop = () => null;

describe('CloudAdapter', function () {
    let sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox({ useFakeTimers: true });
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
