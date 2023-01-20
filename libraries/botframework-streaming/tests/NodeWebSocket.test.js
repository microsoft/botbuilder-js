const { expect } = require('chai');
const { FauxSock, FauxSocket, TestRequest, waitFor } = require('./helpers');
const { NodeWebSocket } = require('../');
const { randomBytes } = require('crypto');
const { Server } = require('ws');

const TEST_SERVER_PORT = 53978;

describe.only('NodeWebSocket', function () {
    it('creates a new NodeWebSocket', function () {
        const socket = new NodeWebSocket(new FauxSock());
        expect(socket).to.be.instanceOf(NodeWebSocket);
        expect(socket.close()).to.not.throw;
    });

    it('starts out connected', function () {
        const socket = new NodeWebSocket(new FauxSock());
        expect(socket.isConnected).to.be.true;
    });

    it('writes to the socket', function () {
        const socket = new NodeWebSocket(new FauxSock());
        const buff = Buffer.from('hello');
        expect(socket.write(buff)).to.not.throw;
    });

    it('attempts to open a connection', function () {
        const socket = new NodeWebSocket();
        expect(
            socket.connect('ws://127.0.0.1:8082/').catch((error) => {
                expect(error.message).to.equal('connect ECONNREFUSED 127.0.0.1:8082');
            })
        );
    });

    it('can set message handlers on the socket', function () {
        const sock = new FauxSock();
        const socket = new NodeWebSocket(sock);
        expect(sock.messageHandler).to.be.undefined;
        expect(socket.setOnMessageHandler(() => {})).to.not.throw;
        expect(sock.messageHandler).to.not.be.undefined;
    });

    it('can set error handler on the socket', function () {
        const sock = new FauxSock();
        const socket = new NodeWebSocket(sock);
        expect(sock.errorHandler).to.be.undefined;
        expect(socket.setOnErrorHandler(() => {})).to.not.throw;
        expect(sock.errorHandler).to.not.be.undefined;
    });

    it('can set end handler on the socket', function () {
        const sock = new FauxSock();
        const socket = new NodeWebSocket(sock);
        expect(sock.closeHandler).to.be.undefined;
        expect(socket.setOnCloseHandler(() => {})).to.not.throw;
        expect(sock.closeHandler).to.not.be.undefined;
    });

    it('create() should be successful and set a WebSocket', async function () {
        const sock = new FauxSocket();
        const nodeSocket = new NodeWebSocket();
        const request = new TestRequest();

        // Configure a proper upgrade request for `ws`.
        request.setIsUpgradeRequest(true);
        request.headers = { upgrade: 'websocket' };
        // Use Node.js `crypto` module to calculate a valid 'sec-websocket-key' value.
        // The key must pass this RegExp:
        // https://github.com/websockets/ws/blob/0a612364e69fc07624b8010c6873f7766743a8e3/lib/websocket-server.js#L12
        request.headers['sec-websocket-key'] = randomBytes(16).toString('base64');
        request.headers['sec-websocket-version'] = '13';
        request.headers['sec-websocket-protocol'] = '';

        await nodeSocket.create(request, sock, Buffer.from([]));
    });

    describe('test against a WebSocket server', function () {
        let serverEvents;
        let server;
        let serverSocket;

        beforeEach(function () {
            return new Promise((resolve) => {
                server = new Server({ path: '/some-path', port: TEST_SERVER_PORT });
                serverEvents = [];

                server.on('connection', function (socket) {
                    serverEvents.push(['connection', socket]);

                    serverSocket = socket;
                    serverSocket.emit();
                    serverSocket.send('welcome');
                    serverSocket.on('message', function (data) {
                        serverEvents.push(['message', data]);
                    });
                    serverSocket.on('close', function (code, reason) {
                        serverEvents.push(['close', code, reason]);
                    });
                });

                server.on('listening', resolve);
            });
        });

        afterEach(function () {
            server.close();
        });

        describe('connect to a WebSocket server', function () {
            let events;
            let nodeSocket;

            beforeEach(function () {
                nodeSocket = new NodeWebSocket();
                events = [];

                const connectPromise = nodeSocket.connect(`ws://localhost:${server.address().port}/some-path`);

                nodeSocket.setOnCloseHandler((code, reason) => events.push(['close', code, reason]));
                nodeSocket.setOnErrorHandler((error) => events.push(['error', error]));
                nodeSocket.setOnMessageHandler((data) => events.push(['message', data]));

                return connectPromise;
            });

            afterEach(function () {
                try {
                    nodeSocket.close();
                    // eslint-disable-next-line no-empty
                } catch {}
            });

            it('should connect to the server', function () {
                return waitFor(() => {
                    expect(serverEvents).to.have.lengthOf(1);
                    expect(serverEvents[0]).deep.to.equals(['connection', serverSocket]);
                });
            });

            describe('isConnected property', function () {
                it('should be true', function () {
                    expect(nodeSocket.isConnected).to.be.true;
                });
            });

            it('should receive initial message', function () {
                return waitFor(() => {
                    expect(events).to.have.lengthOf(1);
                    // Initial message from server is text, not Uint8Array.
                    expect(events[0]).deep.to.equals(['message', 'welcome']);
                });
            });

            describe('after sending a binary message', function () {
                beforeEach(function () {
                    nodeSocket.write(new TextEncoder().encode('morning'));
                });

                it('should send to the server', function () {
                    return waitFor(() => {
                        expect(serverEvents).to.have.lengthOf(2);
                        expect(new TextDecoder().decode(serverEvents[1][1])).to.equal('morning');
                    });
                });
            });

            describe('after server send a binary message', function () {
                beforeEach(function () {
                    serverSocket.send(new TextEncoder().encode('afternoon'));
                });

                it('should receive the message', function () {
                    return waitFor(() => {
                        expect(events).to.have.lengthOf(2);
                        expect(new TextDecoder().decode(events[1][1])).to.equal('afternoon');
                    });
                });
            });

            it('should close with code and reason', function () {
                nodeSocket.close(3000, 'bye');

                return waitFor(() => {
                    expect(serverEvents).to.have.lengthOf(2);
                    expect(serverEvents[1]).deep.to.equals(['close', 3000, 'bye']);
                });
            });

            describe('when server close connection', function () {
                beforeEach(function () {
                    serverSocket.close(4999, 'goodnight');
                });

                it('should receive close event', function () {
                    return waitFor(() => {
                        expect(events).to.have.lengthOf(2);
                        expect(events[1]).deep.to.equals(['close', 4999, 'goodnight']);
                    });
                });
            });

            describe('when server terminated the connection', function () {
                beforeEach(function () {
                    serverSocket.terminate();
                });

                it('should receive close event with code 1006', function () {
                    return waitFor(() => {
                        expect(events).to.have.lengthOf(2);

                        // 1006 is "close outside of Web Socket".
                        expect(events[1]).deep.to.equals(['close', 1006, '']);
                    });
                });
            });
        });
    });
});
