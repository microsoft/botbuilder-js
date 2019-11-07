const { BotFrameworkAdapter, StatusCodes } = require('../');
const { ActivityHandler } = require('botbuilder-core');
const chai = require('chai');
const { randomBytes } = require('crypto');
const { Socket } = require('net');
const sinon = require('sinon');
const expect = chai.expect;

function createNetSocket(readable = true, writable = true) {
    return new Socket({ readable, writable });
}

// Mock of botframework-streaming/src/interfaces/IReceiveRequest
class MockedReceiveRequest {
    constructor(options = {}) {
        const config = Object.assign({
            verb: 'POST',
            path: '/api/messages',
            streams: []
        }, options);

        this.verb = config.verb;
        this.path = config.path;
        this.streams = config.streams;
    }
}

class TestRequest {
    constructor(method = 'GET',) {
        this.method = method;
        let headers = [];
    }

    status() {
        return this.statusVal;
    }

    status(value) {
        this.statusVal = value;
    }

    // path(value) {
    //     this.pathVal = value;
    // }

    // path() {
    //     return this.pathVal;
    // }

    // verb(value) {
    //     this.verbVal = value;
    // }

    // verb() {
    //     return this.verbVal;
    // }

    streams(value) {
        this.streamsVal = value;
    }

    streams() {
        return this.streamsVal;
    }

    setHeaders() {
        return this.headersVal;
    }

    setHeaders(value) {
        this.headers = value;
    }

}

class TestResponse {
    send(value) {
        this.sendVal = value;
        return this.sendVal;
    }

    status(value) {
        this.statusVal = value;
        return this.statusVal;
    }

    setClaimUpgrade(value) {
        this.claimUpgradeVal = value;
    }

    claimUpgrade() {
        return this.claimUpgradeVal;
    }
}

class TestAdapterSettings {
    constructor(appId = undefined, appPassword = undefined, channelAuthTenant, oAuthEndpoint, openIdMetadata, channelServce) {
        this.appId = appId;
        this.appPassword = appPassword;
        this.enableWebSockets = true;
    }
}

describe('BotFrameworkAdapter Streaming tests', () => {

    it('has the correct status codes', () => {
        expect(StatusCodes.OK).to.equal(200);
        expect(StatusCodes.BAD_REQUEST).to.equal(400);
        expect(StatusCodes.UNAUTHORIZED).to.equal(401);
        expect(StatusCodes.NOT_FOUND).to.equal(404);
        expect(StatusCodes.METHOD_NOT_ALLOWED).to.equal(405);
        expect(StatusCodes.UPGRADE_REQUIRED).to.equal(426);
        expect(StatusCodes.INTERNAL_SERVER_ERROR).to.equal(500);
        expect(StatusCodes.NOT_IMPLEMENTED).to.equal(501);
    });

    it('gets constructed properly', () => {
        const adapter = new BotFrameworkAdapter();

        expect(adapter).to.be.instanceOf(BotFrameworkAdapter);
    });

    it('starts and stops a namedpipe server', () => {
        const adapter = new BotFrameworkAdapter();

        adapter.useNamedPipe('PipeyMcPipeface', async (context) => {
            await bot.run(context);
        });
        expect(adapter.streamingServer.disconnect()).to.not.throw;
    });

    it('starts and stops a websocket server', async () => {
        const bot = new ActivityHandler();
        const adapter = new BotFrameworkAdapter(new TestAdapterSettings());
        const request = new TestRequest();
        
        request.headers = [];
        request.headers['upgrade'] = 'websocket';
        request.headers['sec-websocket-key'] = randomBytes(16).toString('base64');
        request.headers['sec-websocket-version'] = '13';
        request.headers['sec-websocket-protocol'] = '';

        const response = new TestResponse({ claimUpgrade: 'anything' });
        const mockedSocket = new createNetSocket();

        response.socket = mockedSocket;
        response.setClaimUpgrade({ socket: mockedSocket, head: 'websocket' });
        await adapter.useWebSocket(request, response, async (context) => {
            await bot.run(context);
        });
    });

    it('returns a connector client', async () => {
        const bot = new ActivityHandler();
        const adapter = new BotFrameworkAdapter(new TestAdapterSettings());
        let request = new TestRequest();
        
        request.headers = [];
        request.headers['upgrade'] = 'websocket';
        request.headers['sec-websocket-key'] = randomBytes(16).toString('base64');
        request.headers['sec-websocket-version'] = '13';
        request.headers['sec-websocket-protocol'] = '';
        let response = new TestResponse();
        const mockedSocket = new createNetSocket();

        response.socket = mockedSocket;
        response.setClaimUpgrade({ socket: mockedSocket, head: 'websocket' });

        await adapter.useWebSocket(request, response, async (context) => {
            await bot.run(context);
        });
        const cc = adapter.createConnectorClient('urn:test');
        expect(cc.baseUri).to.equal('urn:test');
    });

    describe('useWebSocket()', () => {
        it('connects', async () => {
            const bot = new ActivityHandler();
            const adapter = new BotFrameworkAdapter(new TestAdapterSettings());
            let request = new TestRequest();
            
            request.headers = [];
            request.headers['upgrade'] = 'websocket';
            request.headers['sec-websocket-key'] = randomBytes(16).toString('base64');
            request.headers['sec-websocket-version'] = '13';
            request.headers['sec-websocket-protocol'] = '';
            let response = new TestResponse();
            const mockedSocket = new createNetSocket();

            response.socket = mockedSocket;
            response.setClaimUpgrade({ socket: mockedSocket, head: 'websocket' });

            await adapter.useWebSocket(request, response, async (context) => {
                await bot.run(context);
            });
        });

        it('returns status code 401 when request is not authorized', async () => {
            const bot = new ActivityHandler();
            const settings = new TestAdapterSettings('appId', 'password');
            const adapter = new BotFrameworkAdapter(settings);
            let request = new TestRequest();
            
            request.setHeaders({ channelid: 'fakechannel', authorization: 'donttrustme' });
            let response = new TestResponse();

            await adapter.useWebSocket(request, response, async (context) => {
                await bot.run(context);
                throw new Error('useWebSocket should have thrown an error');
            }).catch(err => {
                expect(err.message).to.equal('Unauthorized. Is not authenticated');
            });
        });
    });

    describe('processRequest()', () => {
        it('returns a 400 when the request is missing verb', async () => {
            const adapter = new BotFrameworkAdapter();
            let request = new TestRequest();
            request.verb = undefined;
            request.path = '/api/messages';
            let fakeStream = {
                readAsJson: function () { return { type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(400);
        });

        it('returns a 400 when the request is missing path', async () => {
            const adapter = new BotFrameworkAdapter();
            let request = new TestRequest();
            request.verb = 'POST';
            request.path = undefined;
            let fakeStream = {
                readAsJson: function () { return { type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(400);
        });

        it('returns a 400 when the request body is missing', async () => {
            const adapter = new BotFrameworkAdapter();
            let request = new TestRequest('POST', '/api/messages');
            request.verb = 'POST';
            request.path = '/api/messages';
            request.streams = undefined;

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(400);
        });

        it('returns user agent information when a GET hits the version endpoint', async () => {
            const adapter = new BotFrameworkAdapter();
            let request = new TestRequest();
            request.verb = 'GET';
            request.path = '/api/version';
            let fakeStream = {
                readAsJson: function () { return { type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(200);
            expect(response.streams[0].content).to.not.be.undefined;
        });

        it('returns user agent information from cache when a GET hits the version endpoint more than once', async () => {
            const adapter = new BotFrameworkAdapter();
            let request = new TestRequest();
            request.verb = 'GET';
            request.path = '/api/version';
            let fakeStream = {
                readAsJson: function () { return { type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(200);
            expect(response.streams[0].content).to.not.be.undefined;

            const response2 = await adapter.processRequest(request);
            expect(response2.statusCode).to.equal(200);
            expect(response2.streams[0].content).to.not.be.undefined;
        });

        it('returns 405 for unsupported methods', async () => {
            const adapter = new BotFrameworkAdapter();
            let request = new TestRequest();
            request.verb = 'UPDATE';
            request.path = '/api/version';
            let fakeStream = {
                readAsJson: function () { return { type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(405);
        });

        it('returns 404 for unsupported paths', async () => {
            const adapter = new BotFrameworkAdapter();
            let request = new TestRequest();
            request.verb = 'POST';
            request.path = '/api/supersecretbackdoor';
            let fakeStream = {
                readAsJson: function () { return { type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(404);
        });

        it('processes a well formed request when there is no middleware with a non-Invoke activity type', async () => {
            const bot = new ActivityHandler();
            const adapter = new BotFrameworkAdapter();
            let request = new TestRequest();
            request.verb = 'POST';
            request.path = '/api/messages';
            let fakeStream = {
                readAsJson: function () { return { type: 'something', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            adapter.logic = async (context) => {
                await bot.run(context);
            };

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(200);
        });

        it('returns a 501 when activity type is invoke, but the activity is invalid', async () => {
            const bot = new ActivityHandler();
            const adapter = new BotFrameworkAdapter();
            let request = new TestRequest();
            request.verb = 'POST';
            request.path = '/api/messages';
            let fakeStream = {
                readAsJson: function () { return { type: 'invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            adapter.logic = async (context) => {
                await bot.run(context);
            };

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(501);
        });

        it('returns a 500 when bot can not run', async () => {
            const MiddleWare = require('botbuilder-core');
            const bot = {};
            let mw = {
                async onTurn(context, next) {
                    console.log('Middleware executed!');
                    await next();
                }
            };
            let mwset = [];
            mwset.push(mw);
            const adapter = new BotFrameworkAdapter({ bot: bot, middleWare: mwset });
            let request = new TestRequest();
            request.verb = 'POST';
            request.path = '/api/messages';
            let fakeStream = {
                readAsJson: function () { return { type: 'invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(500);
        });

        it('executes middleware', async () => {
            const bot = new ActivityHandler();
            bot.run = function (turnContext) { return Promise.resolve(); };

            const adapter = new BotFrameworkAdapter();
            let middlewareCalled = false;
            const middleware = {
                async onTurn(context, next) {
                    middlewareCalled = true;
                    return next();
                }
            }

            adapter.use(middleware);

            const runSpy = sinon.spy(bot, 'run');
            let request = new TestRequest();
            request.verb = 'POST';
            request.path = '/api/messages';
            let fakeStream = {
                readAsJson: function () { return { type: 'invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            adapter.logic = async (context) => {
                await bot.run(context);
            };

            const response = await adapter.processRequest(request);
            expect(response.statusCode).to.equal(501);
            expect(runSpy.called).to.be.true;
            expect(middlewareCalled).to.be.true;
        });
    });

    it('sends a request', async () => {
        const bot = new ActivityHandler();
        const adapter = new BotFrameworkAdapter(new TestAdapterSettings());
        let request = new TestRequest();
        
        request.headers = [];
        request.headers['upgrade'] = 'websocket';
        request.headers['sec-websocket-key'] = randomBytes(16).toString('base64');
        request.headers['sec-websocket-version'] = '13';
        request.headers['sec-websocket-protocol'] = '';
        let response = new TestResponse();

        const mockedSocket = new createNetSocket();

        response.socket = mockedSocket;
        const spy = sinon.spy(mockedSocket, "write");
        response.setClaimUpgrade({ socket: mockedSocket, head: 'websocket' });

        try {
            await adapter.useWebSocket(request, response, async (context) => {
                await bot.run(context);
            })
        } catch (err) {
            throw err;
        }

        let connection = adapter.createConnectorClient('fakeUrl');
        connection.sendRequest({ method: 'POST', url: 'testResultDotCom', body: 'Test body!' });
        expect(spy.called).to.be.true;
    }).timeout(2000);

    describe('private methods', () => {
        it('should identify streaming connections', function () {
            const serviceUrls = [
                'urn:botframework:WebSocket:wss://beep.com',
                'URN:botframework:WebSocket:http://beep.com',
            ];

            serviceUrls.forEach(serviceUrl => {
                expect(BotFrameworkAdapter.isStreamingServiceUrl(serviceUrl)).to.be.true;
            });
        });

        it('should identify http connections', function () {
            const serviceUrls = [
                'http://yayay.com',
                'HTTPS://yayay.com',
            ];

            serviceUrls.forEach(serviceUrl => {
                expect(BotFrameworkAdapter.isStreamingServiceUrl(serviceUrl)).to.be.false;
            });
        });
    });
});
