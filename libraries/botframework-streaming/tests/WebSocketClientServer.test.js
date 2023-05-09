const { expect } = require('chai');
const { Server } = require('ws');
const { spy, stub } = require('sinon');

const {
    NodeWebSocket,
    RequestHandler,
    StreamingRequest,
    StreamingResponse,
    WebSocketClient,
    WebSocketServer,
} = require('../');

const { createDeferred, expectEventually } = require('./helpers');

class EchoRequestHandler extends RequestHandler {
    // RequestHandler.processRequest is marked as abstract.
    // When stubbing it, we need a member declaration, even if it is empty.
    async processRequest() {}
}

async function echoRequest(request) {
    const response = StreamingResponse.create(200);

    response.setBody(await request.streams[0].readAsString());

    return response;
}

describe('WebSocket Client/Server Tests', function () {
    let activeConnections;
    let clientProcessRequest;
    let firstConnectionDeferred;
    let firstDisconnectionDeferred;
    let httpServer;
    let server;
    let serverProcessRequest;
    let serverStartPromise;

    this.beforeEach(() => {
        const serverRequestHandler = new EchoRequestHandler();

        activeConnections = [];
        firstConnectionDeferred = createDeferred();
        firstDisconnectionDeferred = createDeferred();
        serverProcessRequest = stub(serverRequestHandler, 'processRequest').callsFake(echoRequest);

        httpServer = new Server({ port: 0 }).on('connection', (webSocket) => {
            activeConnections.push(webSocket);
            firstConnectionDeferred.resolve(webSocket);

            server = new WebSocketServer(new NodeWebSocket(webSocket), serverRequestHandler);
            serverStartPromise = server.start();

            webSocket.on('close', () => {
                activeConnections = activeConnections.filter((s) => s !== webSocket);

                firstDisconnectionDeferred.resolve(webSocket);
            });
        });
    });

    this.afterEach(() => {
        activeConnections.map((connection) => connection.close());
        httpServer.close();
    });

    describe('connected', function () {
        let client;
        const disconnectionHandler = spy();

        this.beforeEach(function () {
            const address = httpServer.address();
            const requestHandler = new EchoRequestHandler();
            const url = `ws://${typeof address === 'string' ? address : `localhost:${address.port}`}`;

            clientProcessRequest = stub(requestHandler, 'processRequest').callsFake(echoRequest);

            client = new WebSocketClient({ disconnectionHandler, requestHandler, url });

            expect(client).to.be.instanceOf(WebSocketClient);

            return client.connect();
        });

        it('should connect to server', async function () {
            await firstConnectionDeferred.promise;
            expect(activeConnections.length).to.equal(1);
        });

        describe('client', function () {
            describe('sends', function () {
                let sendPromise;

                this.beforeEach(function () {
                    const req = new StreamingRequest();
                    req.Verb = 'POST';
                    req.Path = 'some/path';
                    req.setBody('Hello World!');
                    sendPromise = client.send(req);
                    return sendPromise;
                });

                it('server should process the request', function () {
                    expect(serverProcessRequest.callCount).to.equal(1);
                });

                it('should receive response', async function () {
                    const response = await sendPromise;
                    await expect(response.streams.length).to.equal(1);
                    (await expectEventually(response.streams[0].readAsString())).to.equal('"Hello World!"');
                });
            });

            describe('disconnects', function () {
                this.beforeEach(async function () {
                    client.disconnect();
                    await firstDisconnectionDeferred.promise;
                });

                it('should call disconnectHandler', function () {
                    expect(disconnectionHandler.called).to.be.true;
                });

                it('should disconnect', function () {
                    expect(activeConnections.length).to.equal(0);
                });
            });

            describe('sends and waiting for server to process', function () {
                let sendPromise;
                let serverProcessRequestDeferred;

                this.beforeEach(async function () {
                    serverProcessRequestDeferred = createDeferred();
                    // Will not resolve the processRequest promise and never respond.
                    serverProcessRequest.returns(new Promise(serverProcessRequestDeferred.resolve));
                    const req = new StreamingRequest();
                    req.Verb = 'POST';
                    req.Path = 'some/path';
                    req.setBody('Hello World!');
                    sendPromise = client.send(req);
                    await serverProcessRequestDeferred.promise;
                });

                it('when client disconnect should throw', async function () {
                    client.disconnect();
                    (await expectEventually(sendPromise)).to.throw('Disconnect was called.');
                });

                it('when server disconnect should throw', async function () {
                    server.disconnect();
                    (await expectEventually(sendPromise)).to.throw('Disconnect was called.');
                });
            });
        });

        describe('server', function () {
            describe('sends', function () {
                let sendPromise;

                this.beforeEach(function () {
                    const req = new StreamingRequest();
                    req.Verb = 'POST';
                    req.Path = 'some/path';
                    req.setBody('Hello World!');
                    sendPromise = server.send(req);
                    return sendPromise;
                });

                it('client should process the request', function () {
                    expect(clientProcessRequest.callCount).to.equal(1);
                });

                it('should receive response', async function () {
                    const response = await sendPromise;
                    await expect(response.streams.length).to.equal(1);
                    (await expectEventually(response.streams[0].readAsString())).to.equal('"Hello World!"');
                });
            });

            describe('disconnects', function () {
                this.beforeEach(async function () {
                    server.disconnect();
                    await firstDisconnectionDeferred.promise;
                });

                it('should call disconnectHandler', function () {
                    expect(disconnectionHandler.called).to.be.true;
                });

                it('should disconnect', function () {
                    expect(activeConnections.length).to.equal(0);
                });

                it('should resolve connect()', function () {
                    return serverStartPromise;
                });
            });

            describe('sends and waiting for client to process', function () {
                let sendPromise;
                let clientProcessRequestDeferred;

                this.beforeEach(async function () {
                    clientProcessRequestDeferred = createDeferred();
                    // Will not resolve the processRequest promise and never respond.
                    clientProcessRequest.returns(new Promise(clientProcessRequestDeferred.resolve));
                    const req = new StreamingRequest();
                    req.Verb = 'POST';
                    req.Path = 'some/path';
                    req.setBody('Hello World!');
                    sendPromise = client.send(req);
                    await clientProcessRequestDeferred.promise;
                });

                it('when client disconnect should throw', async function () {
                    client.disconnect();
                    (await expectEventually(sendPromise)).to.throw('Disconnect was called.');
                });

                it('when server disconnect should throw', async function () {
                    server.disconnect();
                    (await expectEventually(sendPromise)).to.throw('Disconnect was called.');
                });
            });
        });
    });

    describe('client connects to bad URL', function () {
        let client;

        this.beforeEach(function () {
            client = new WebSocketClient({ url: 'fakeURL.localhost' });
        });

        it('should throw', async function () {
            (await expectEventually(client.connect())).to.throw('Unable to connect client to Node transport.');
        });
    });

    describe('server throws a TypeError during construction if missing the "socket" parameter', function () {
        expect(() => new WebSocketServer()).to.throw('WebSocketServer: Missing socket parameter');
    });
});
