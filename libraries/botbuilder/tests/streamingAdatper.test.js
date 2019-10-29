const { StatusCodes, StreamingAdapter } = require('../');
const { ActivityHandler } = require('botbuilder-core');
const chai = require('chai');
const expect = chai.expect;

class FauxSock {
    constructor(contentString) {
        if (contentString) {
            this.contentString = contentString;
            this.position = 0;
        }
        this.connected = true;
    }
    isConnected() { return this.connected; }
    write(buffer) { return; }
    connect(serverAddress) { return new Promise(); }
    close() { this.connected = false; return; }
    setOnMessageHandler(handler) { return; } //(x: any) => void);
    setOnErrorHandler(handler) { return; }
    setOnCloseHandler(handler) { return; }
}

class TestRequest {
    constructor() {
        let headers = [];
    }

    isUpgradeRequest() {
        return this.upgradeRequestVal;
    }

    setIsUpgradeRequest(value) {
        this.upgradeRequestVal = value;
    }

    status() {
        return this.statusVal;
    }

    status(value) {
        this.statusVal = value;
    }

    path(value) {
        this.pathVal = value;
    }

    path() {
        return this.pathVal;
    }

    verb(value) {
        this.verbVal = value;
    }

    verb() {
        return this.verbVal;
    }

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

describe('BotFrameworkStreamingAdapter tests', () => {

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
        let handler = new StreamingAdapter();

        expect(handler).to.be.instanceOf(StreamingAdapter);
    });

    it('starts and stops a namedpipe server', () => {
        let handler = new StreamingAdapter();

        handler.useNamedPipe('PipeyMcPipeface', async (context) => {
            // Route to bot
            await bot.run(context);
        });
        expect(handler.streamingServer.disconnect()).to.not.throw;
    });

    it('starts and stops a websocket server', async () => {
        const bot = new ActivityHandler();
        const handler = new StreamingAdapter(new TestAdapterSettings());
        const request = new TestRequest();
        request.setIsUpgradeRequest(true);
        request.headers = [];
        request.headers['upgrade'] = 'websocket';
        request.headers['sec-websocket-key'] = 'BFlat';
        request.headers['sec-websocket-version'] = '13';
        request.headers['sec-websocket-protocol'] = '';

        const response = new TestResponse({ claimUpgrade: 'anything' });
        const fakeSocket = {
            unshift: function () { return true; },
            write: function (value) { },
            on: function (value) { },
            read: function () { return new Buffer.from('data', 'utf8'); },
            end: function () { return; },
        };
        response.setClaimUpgrade({ socket: fakeSocket, head: 'websocket' });
        await handler.useWebSocket(request, response, async (context) => {
            // Route to bot
            await bot.run(context);
        });
    });

    it('returns a connector client', async () => {
        let bot = new ActivityHandler();
        let handler = new StreamingAdapter(new TestAdapterSettings());
        let request = new TestRequest();
        request.setIsUpgradeRequest(true);
        request.headers = [];
        request.headers['upgrade'] = 'websocket';
        request.headers['sec-websocket-key'] = 'BFlat';
        request.headers['sec-websocket-version'] = '13';
        request.headers['sec-websocket-protocol'] = '';
        let response = new TestResponse();
        let fakeSocket = {
            unshift: function () { return true; },
            write: function (value) { },
            on: function (value) { },
            read: function () { return new Buffer.from('data', 'utf8'); },
            end: function () { return; },
        };
        response.socket = fakeSocket;
        response.setClaimUpgrade({ socket: fakeSocket, head: 'websocket' });

        await handler.useWebSocket(request, response, async (context) => {
            // Route to bot
            await bot.run(context);
        });
        const cc = handler.createConnectorClient('urn:test');
        expect(cc.baseUri).to.equal('urn:test');
    });

    describe('useWebSocket()', () => {
        it('connects', async () => {
            let bot = new ActivityHandler();
            let handler = new StreamingAdapter(new TestAdapterSettings());
            let request = new TestRequest();
            request.setIsUpgradeRequest(true);
            request.headers = [];
            request.headers['upgrade'] = 'websocket';
            request.headers['sec-websocket-key'] = 'BFlat';
            request.headers['sec-websocket-version'] = '13';
            request.headers['sec-websocket-protocol'] = '';
            let response = new TestResponse();
            let fakeSocket = {
                unshift: function () { return true; },
                write: function (value) { },
                on: function (value) { },
                read: function () { return new Buffer.from('data', 'utf8'); },
                end: function () { return; },
            };
            response.socket = fakeSocket;
            response.setClaimUpgrade({ socket: fakeSocket, head: 'websocket' });

            await handler.useWebSocket(request, response, async (context) => {
                // Route to bot
                await bot.run(context);
            });
        });

        it('returns status code 401 when request is not authorized', async () => {
            let bot = new ActivityHandler();
            const settings = new TestAdapterSettings('appId', 'password');
            let handler = new StreamingAdapter(settings);
            let request = new TestRequest();
            request.setIsUpgradeRequest(true);
            request.setHeaders({ channelid: 'fakechannel', authorization: 'donttrustme' });
            let response = new TestResponse();

            await handler.useWebSocket(request, response, async (context) => {
                // Route to bot
                await bot.run(context);
                throw new Error('useWebSocket should have thrown an error');
            }).catch(err => {
                expect(err.message).to.equal('Unauthorized. Is not authenticated');
            });
        });
    });

    describe('processRequest()', () => {
        it('returns a 400 when the request is missing verb', async () => {
            let handler = new StreamingAdapter();
            let request = new TestRequest();
            request.verb = undefined;
            request.path = '/api/messages';
            let fakeStream = {
                readAsJson: function () { return { type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            const response = await handler.processRequest(request);
            expect(response.statusCode).to.equal(400);
        });

        it('returns a 400 when the request is missing path', async () => {
            let handler = new StreamingAdapter();
            let request = new TestRequest();
            request.verb = 'POST';
            request.path = undefined;
            let fakeStream = {
                readAsJson: function () { return { type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            const response = await handler.processRequest(request);
            expect(response.statusCode).to.equal(400);
        });

        it('returns a 400 when the request body is missing', async () => {
            let handler = new StreamingAdapter();
            let request = new TestRequest('POST', '/api/messages');
            request.verb = 'POST';
            request.path = '/api/messages';
            request.streams = undefined;

            const response = await handler.processRequest(request);
            expect(response.statusCode).to.equal(400);
        });

        it('returns user agent information when a GET hits the version endpoint', async () => {
            let handler = new StreamingAdapter();
            let request = new TestRequest();
            request.verb = 'GET';
            request.path = '/api/version';
            let fakeStream = {
                readAsJson: function () { return { type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            const response = await handler.processRequest(request);
            expect(response.statusCode).to.equal(200);
            expect(response.streams[0].content).to.not.be.undefined;
        });

        it('returns user agent information from cache when a GET hits the version endpoint more than once', async () => {
            let handler = new StreamingAdapter();
            let request = new TestRequest();
            request.verb = 'GET';
            request.path = '/api/version';
            let fakeStream = {
                readAsJson: function () { return { type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            const response = await handler.processRequest(request);
            expect(response.statusCode).to.equal(200);
            expect(response.streams[0].content).to.not.be.undefined;

            const response2 = await handler.processRequest(request);
            expect(response2.statusCode).to.equal(200);
            expect(response2.streams[0].content).to.not.be.undefined;
        });

        it('returns 405 for unsupported methods', async () => {
            let handler = new StreamingAdapter();
            let request = new TestRequest();
            request.verb = 'UPDATE';
            request.path = '/api/version';
            let fakeStream = {
                readAsJson: function () { return { type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            const response = await handler.processRequest(request);
            expect(response.statusCode).to.equal(405);
        });

        it('returns 404 for unsupported paths', async () => {
            let handler = new StreamingAdapter();
            let request = new TestRequest();
            request.verb = 'POST';
            request.path = '/api/supersecretbackdoor';
            let fakeStream = {
                readAsJson: function () { return { type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            const response = await handler.processRequest(request);
            expect(response.statusCode).to.equal(404);
        });

        it('processes a well formed request when there is no middleware with a non-Invoke activity type', async () => {
            let bot = new ActivityHandler();
            let handler = new StreamingAdapter();
            let request = new TestRequest();
            request.verb = 'POST';
            request.path = '/api/messages';
            let fakeStream = {
                readAsJson: function () { return { type: 'something', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            handler.logic = async (context) => {
                // Route to bot
                await bot.run(context);
            };

            const response = await handler.processRequest(request);
            expect(response.statusCode).to.equal(200);
        });

        it('returns a 501 when activity type is invoke, but the activity is invalid', async () => {
            let bot = new ActivityHandler();
            let handler = new StreamingAdapter();
            let request = new TestRequest();
            request.verb = 'POST';
            request.path = '/api/messages';
            let fakeStream = {
                readAsJson: function () { return { type: 'invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            handler.logic = async (context) => {
                // Route to bot
                await bot.run(context);
            };

            const response = await handler.processRequest(request);
            expect(response.statusCode).to.equal(501);
        });

        it('returns a 500 when bot can not run', async () => {
            const MiddleWare = require('botbuilder-core');
            let bot = {};
            let mw = {
                async onTurn(context, next) {
                    console.log('Middleware executed!');
                    await next();
                }
            };
            let mwset = [];
            mwset.push(mw);
            let handler = new StreamingAdapter({ bot: bot, middleWare: mwset });
            let request = new TestRequest();
            request.verb = 'POST';
            request.path = '/api/messages';
            let fakeStream = {
                readAsJson: function () { return { type: 'invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            const response = await handler.processRequest(request);
            expect(response.statusCode).to.equal(500);
        });

        it('executes middleware', async () => {
            var sinon = require('sinon');
            let bot = new ActivityHandler();
            bot.run = function (turnContext) { return Promise.resolve(); };

            let handler = new StreamingAdapter();
            let middlewareCalled = false;
            const middleware = {
                async onTurn(context, next) {
                    middlewareCalled = true;
                    return next();
                }
            }

            handler.use(middleware);

            const runSpy = sinon.spy(bot, 'run');
            let request = new TestRequest();
            request.verb = 'POST';
            request.path = '/api/messages';
            let fakeStream = {
                readAsJson: function () { return { type: 'invoke', serviceUrl: 'somewhere/', channelId: 'test' }; },
            };
            request.streams[0] = fakeStream;

            handler.logic = async (context) => {
                // Route to bot
                await bot.run(context);
            };

            const response = await handler.processRequest(request);
            expect(response.statusCode).to.equal(501);
            expect(runSpy.called).to.be.true;
            expect(middlewareCalled).to.be.true;
        });
    });

    it('sends a request', async () => {
        let bot = new ActivityHandler();
        let handler = new StreamingAdapter(new TestAdapterSettings());
        let request = new TestRequest();
        request.setIsUpgradeRequest(true);
        request.headers = [];
        request.headers['upgrade'] = 'websocket';
        request.headers['sec-websocket-key'] = 'BFlat';
        request.headers['sec-websocket-version'] = '13';
        request.headers['sec-websocket-protocol'] = '';
        let response = new TestResponse();
        let fakeSocket = {
            unshift: function () { return true; },
            write: function () { return Promise.resolve; },
            on: function () { return; },
            read: function () { return new Buffer.from('data', 'utf8'); },
            end: function () { return Promise.resolve; },
        };
        response.socket = fakeSocket;
        const sinon = require('sinon');
        const spy = sinon.spy(fakeSocket, "write");
        response.setClaimUpgrade({ socket: fakeSocket, head: 'websocket' });

        try {
            await handler.useWebSocket(request, response, async (context) => {
                // Route to bot
                await bot.run(context);
            })
        } catch (err) {
            throw err;
        }

        let connection = handler.createConnectorClient('fakeUrl');
        connection.sendRequest({ method: 'POST', url: 'testResultDotCom', body: 'Test body!' });
        expect(spy.called).to.be.true;
    }).timeout(2000);

    describe('private methods', () => {
        it('should identify streaming connections', function () {
            let activity = {
                type: 'message',
                text: '<at>TestOAuth619</at> test activity',
                recipient: { id: 'TestOAuth619' },
            };

            const streaming = [
                'urn:botframework:WebSocket:wss://beep.com',
                'urn:botframework:WebSocket:http://beep.com',
                'URN:botframework:WebSocket:wss://beep.com',
                'URN:botframework:WebSocket:http://beep.com',
            ];

            streaming.forEach(s => {
                activity.serviceUrl = s;
                expect(StreamingAdapter.isFromStreamingConnection(activity)).to.be.true;
            });
        });

        it('should identify http connections', function () {
            let activity = {
                type: 'message',
                text: '<at>TestOAuth619</at> test activity',
                recipient: { id: 'TestOAuth619' },
            };

            const streaming = [
                'http://yayay.com',
                'https://yayay.com',
                'HTTP://yayay.com',
                'HTTPS://yayay.com',
            ];

            streaming.forEach(s => {
                activity.serviceUrl = s;
                expect(StreamingAdapter.isFromStreamingConnection(activity)).to.be.false;
            });
        });
    });
});
