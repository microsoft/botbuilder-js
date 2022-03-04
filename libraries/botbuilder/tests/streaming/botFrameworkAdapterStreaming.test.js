const assert = require('assert');
const { Socket } = require('net');

const { expect } = require('chai');
const { spy } = require('sinon');
const { ActivityHandler, ActivityTypes, StatusCodes, TurnContext } = require('botbuilder-core');

const { BotFrameworkAdapter } = require('../../');

// Import Helper Classes
const { MockHttpRequest } = require('./mockHttpRequest');
const { MockNetSocket } = require('./mockNetSocket');
const { MockContentStream, MockStreamingRequest } = require('./mockStreamingRequest');

const createNetSocket = (readable = true, writable = true) => {
    return new Socket({ readable, writable });
};

class TestAdapterSettings {
    constructor(appId, appPassword) {
        this.appId = appId;
        this.appPassword = appPassword;
    }
}

class ConnectionTestAdapter extends BotFrameworkAdapter {
    startNamedPipeServer(pipeName) {
        this.namedPipeName = pipeName;
        this.streamingServer = { isConnected: true };
    }
}

describe('BotFrameworkAdapter Streaming tests', function () {
    it('has the correct status codes', function () {
        expect(StatusCodes.OK).to.equal(200);
        expect(StatusCodes.BAD_REQUEST).to.equal(400);
        expect(StatusCodes.UNAUTHORIZED).to.equal(401);
        expect(StatusCodes.NOT_FOUND).to.equal(404);
        expect(StatusCodes.METHOD_NOT_ALLOWED).to.equal(405);
        expect(StatusCodes.UPGRADE_REQUIRED).to.equal(426);
        expect(StatusCodes.INTERNAL_SERVER_ERROR).to.equal(500);
        expect(StatusCodes.NOT_IMPLEMENTED).to.equal(501);
    });

    it('gets constructed properly', function () {
        const adapter = new BotFrameworkAdapter();

        expect(adapter).to.be.instanceOf(BotFrameworkAdapter);
    });

    it('starts and stops a namedpipe server', function () {
        const adapter = new BotFrameworkAdapter();

        adapter.useNamedPipe(async (_) => {}, 'PipeyMcPipeface');
        expect(adapter.streamingServer.disconnect()).to.not.throw;
    });

    it("throws exception when trying to connect to a different named pipe than it's connected to", async function () {
        const adapter = new ConnectionTestAdapter();

        await adapter.useNamedPipe(async (_) => {}, 'NamedPipeTest');

        // Try use same NamedPipe again to trigger error.
        await assert.rejects(
            adapter.useNamedPipe(async (_) => {}, 'NotNamedPipeTest'),
            {
                message:
                    'This BotFrameworkAdapter instance is already connected to a different stream. Use a new instance to connect to the provided pipeName.',
            }
        );
    });

    it("doesn't throw while trying to connect to named pipe it's connected to", async function () {
        const adapter = new ConnectionTestAdapter();
        const namedPipeName = 'NamedPipeTest';

        await adapter.useNamedPipe(async (_) => {}, namedPipeName);

        // Use same NamedPipeName to test scenario.
        await adapter.useNamedPipe(async (_) => {}, namedPipeName);
    });

    it('isStreamingConnectionOpen returns false without a streamingServer', function () {
        const adapter = new BotFrameworkAdapter();

        expect(adapter.isStreamingConnectionOpen).to.be.false;
    });

    it('sendActivities should throw an error if streaming connection is closed.', async function () {
        const activity = {
            serviceUrl: 'urn:botframework:WebSocket:wss://beep.com',
            type: 'message',
        };
        const reply = {
            conversation: { id: 'convo1' },
            ...activity,
        };

        const adapter = new BotFrameworkAdapter({});
        adapter.streamingServer = { isConnected: false };

        await assert.rejects(
            adapter.sendActivities(new TurnContext(adapter, activity), [reply]),
            new Error(
                'BotFrameworkAdapter.sendActivities(): Unable to send activity as Streaming connection is closed.'
            )
        );
    });

    it('starts and stops a websocket server', async function () {
        const bot = new ActivityHandler();
        const adapter = new BotFrameworkAdapter(new TestAdapterSettings());
        const request = new MockHttpRequest();
        const realSocket = createNetSocket();

        await adapter.useWebSocket(request, realSocket, Buffer.from([]), async (context) => {
            await bot.run(context);
        });
    });

    it('returns a connector client', async function () {
        const bot = new ActivityHandler();
        const adapter = new BotFrameworkAdapter(new TestAdapterSettings());
        const request = new MockHttpRequest();
        const realSocket = createNetSocket();

        await adapter.useWebSocket(request, realSocket, Buffer.from([]), async (context) => {
            await bot.run(context);
        });
        const cc = adapter.createConnectorClient('urn:test');
        expect(cc.baseUri).to.equal('urn:test');
    });

    describe('useWebSocket()', function () {
        it('connects', async function () {
            const bot = new ActivityHandler();
            const adapter = new BotFrameworkAdapter(new TestAdapterSettings());
            const request = new MockHttpRequest();
            const realSocket = createNetSocket();

            const writeSpy = spy(realSocket, 'write');
            await adapter.useWebSocket(request, realSocket, Buffer.from([]), async (context) => {
                await bot.run(context);
            });
            expect(writeSpy.called).to.be.true;
        });

        it('returns status code 401 when request is not authorized', async function () {
            const bot = new ActivityHandler();
            const settings = new TestAdapterSettings('appId', 'password');
            const adapter = new BotFrameworkAdapter(settings);
            const request = new MockHttpRequest();
            request.setHeader('authorization', 'donttustme');

            const socket = new MockNetSocket();
            const writeSpy = spy(socket, 'write');
            const destroySpy = spy(socket, 'destroy');

            await assert.rejects(
                adapter.useWebSocket(request, socket, Buffer.from([]), async (context) => {
                    await bot.run(context);
                }),
                (err) => {
                    expect(err.statusCode).to.equal(StatusCodes.UNAUTHORIZED);
                    expect(err.message).to.equal('Unauthorized. Is not authenticated');
                    const socketResponse = MockNetSocket.createNonSuccessResponse(
                        StatusCodes.UNAUTHORIZED,
                        err.message
                    );
                    expect(writeSpy.called).to.be.true;
                    expect(writeSpy.calledWithExactly(socketResponse)).to.be.true;
                    expect(destroySpy.calledOnceWithExactly()).to.be.true;
                    return true;
                }
            );
        });

        it('returns status code 400 when request is missing Authorization header', async function () {
            const bot = new ActivityHandler();
            const settings = new TestAdapterSettings('appId', 'password');
            const adapter = new BotFrameworkAdapter(settings);
            const requestWithoutAuthHeader = new MockHttpRequest();

            const socket = new MockNetSocket();
            const writeSpy = spy(socket, 'write');
            const destroySpy = spy(socket, 'destroy');

            await assert.rejects(
                adapter.useWebSocket(requestWithoutAuthHeader, socket, Buffer.from([]), async (context) => {
                    await bot.run(context);
                }),
                (err) => {
                    expect(err.message).to.equal("'authHeader' required.");
                    expect(err.statusCode).to.equal(StatusCodes.BAD_REQUEST);
                    const socketResponse = MockNetSocket.createNonSuccessResponse(StatusCodes.BAD_REQUEST, err.message);
                    expect(writeSpy.called).to.be.true;
                    expect(writeSpy.calledWithExactly(socketResponse)).to.be.true;
                    expect(destroySpy.calledOnceWithExactly()).to.be.true;
                    return true;
                }
            );
        });

        it('returns status code 500 when request logic is not callable', async function () {
            const adapter = new BotFrameworkAdapter(new TestAdapterSettings());
            const request = new MockHttpRequest();
            const socket = new MockNetSocket();

            const useWebSocketSpy = spy(adapter, 'useWebSocket');
            const uncallableLogic = null;

            await assert.rejects(adapter.useWebSocket(request, socket, Buffer.from([]), uncallableLogic), (err) => {
                expect(err.message).to.equal('Streaming logic needs to be provided to `useWebSocket`');
                expect(useWebSocketSpy.called).to.be.true;
                return true;
            });
        });
    });

    describe('processRequest()', function () {
        it('returns a 400 when the request is missing verb', async function () {
            const adapter = new BotFrameworkAdapter();
            const request = new MockStreamingRequest({
                verb: undefined,
            });

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(StatusCodes.BAD_REQUEST);
        });

        it('returns a 400 when the request is missing path', async function () {
            const adapter = new BotFrameworkAdapter();
            const request = new MockStreamingRequest({
                path: undefined,
            });

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(StatusCodes.BAD_REQUEST);
        });

        it('returns a 400 when the request body is missing', async function () {
            const adapter = new BotFrameworkAdapter();
            const request = new MockStreamingRequest({
                streams: undefined,
            });

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(StatusCodes.BAD_REQUEST);
        });

        it('returns user agent information when a GET hits the version endpoint', async function () {
            const adapter = new BotFrameworkAdapter();
            const request = new MockStreamingRequest({
                path: '/api/version',
                verb: 'GET',
            });

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(StatusCodes.OK);
            expect(response.streams[0].content).to.not.be.undefined;
        });

        it('returns user agent information from cache when a GET hits the version endpoint more than once', async function () {
            const adapter = new BotFrameworkAdapter();
            const request = new MockStreamingRequest({
                path: '/api/version',
                verb: 'GET',
            });

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(StatusCodes.OK);
            expect(response.streams[0].content).to.not.be.undefined;

            const response2 = await adapter.processRequest(request);
            expect(response2.statusCode).to.equal(StatusCodes.OK);
            expect(response2.streams[0].content).to.not.be.undefined;
        });

        it('should return 405 for unsupported methods to valid paths', async function () {
            const adapter = new BotFrameworkAdapter();
            const request = new MockStreamingRequest({
                path: '/api/version',
                verb: 'UPDATE',
            });

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(StatusCodes.METHOD_NOT_ALLOWED);
        });

        it('should return 404 for unsupported paths with valid methods', async function () {
            const adapter = new BotFrameworkAdapter();
            const request = new MockStreamingRequest({
                path: '/api/supersecretbackdoor',
            });

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(StatusCodes.NOT_FOUND);
        });

        it('processes a well formed request when there is no middleware with a non-Invoke activity type', async function () {
            const bot = new ActivityHandler();
            const adapter = new BotFrameworkAdapter();
            const mockStream = async () => ({
                type: ActivityTypes.Message,
                serviceUrl: 'somewhere/',
                channelId: 'test',
            });
            const request = new MockStreamingRequest({
                streams: [new MockContentStream({ readAsJson: mockStream })],
            });

            adapter.logic = async (context) => {
                await bot.run(context);
            };

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(StatusCodes.OK);
        });

        it('returns a 501 when activity type is invoke, but the activity is invalid', async function () {
            const bot = new ActivityHandler();
            const adapter = new BotFrameworkAdapter();
            const request = new MockStreamingRequest();

            adapter.logic = async (context) => {
                await bot.run(context);
            };

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(StatusCodes.NOT_IMPLEMENTED);
        });

        it('returns a 500 when BotFrameworkAdapter.logic is not callable', async function () {
            const adapter = new BotFrameworkAdapter();
            const request = new MockStreamingRequest();

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
        });

        it('returns a 500 and calls middleware when BotFrameworkAdapter.logic is not callable', async function () {
            let middlewareCalled = false;
            const middleware = {
                async onTurn(context, next) {
                    middlewareCalled = true;
                    await next();
                },
            };

            const adapter = new BotFrameworkAdapter();
            adapter.use(middleware);
            const request = new MockStreamingRequest();

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(middlewareCalled).to.be.true;
        });

        it('executes middleware', async function () {
            const bot = new ActivityHandler();
            const adapter = new BotFrameworkAdapter();

            let middlewareCalled = false;
            const middleware = {
                async onTurn(context, next) {
                    middlewareCalled = true;
                    return next();
                },
            };

            adapter.use(middleware);

            const runSpy = spy(bot, 'run');
            const request = new MockStreamingRequest();

            adapter.logic = async (context) => {
                await bot.run(context);
            };

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(StatusCodes.NOT_IMPLEMENTED);
            expect(runSpy.called).to.be.true;
            expect(middlewareCalled).to.be.true;
        });
    });

    it('sends a request', async function () {
        const bot = new ActivityHandler();
        const adapter = new BotFrameworkAdapter(new TestAdapterSettings());
        const request = new MockHttpRequest();
        const realSocket = createNetSocket();

        const writeSpy = spy(realSocket, 'write');

        await adapter.useWebSocket(request, realSocket, Buffer.from([]), async (context) => {
            await bot.run(context);
        });

        const connection = adapter.createConnectorClient('fakeUrl');
        connection.sendRequest({ method: 'POST', url: 'testResultDotCom', body: 'Test body!' });
        expect(writeSpy.called).to.be.true;
    }).timeout(2000);

    describe('private methods', function () {
        it('should identify streaming connections', function () {
            const serviceUrls = [
                'urn:botframework:WebSocket:wss://beep.com',
                'URN:botframework:WebSocket:http://beep.com',
            ];

            serviceUrls.forEach((serviceUrl) => {
                expect(BotFrameworkAdapter.isStreamingServiceUrl(serviceUrl)).to.be.true;
            });
        });

        it('should identify http connections', function () {
            const serviceUrls = ['http://yayay.com', 'HTTPS://yayay.com'];

            serviceUrls.forEach((serviceUrl) => {
                expect(BotFrameworkAdapter.isStreamingServiceUrl(serviceUrl)).to.be.false;
            });
        });
    });
});
