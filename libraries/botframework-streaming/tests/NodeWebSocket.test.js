const { NodeWebSocket } = require('../');
const { expect } = require('chai');
const { FauxSock, TestRequest } = require('./helpers');
const { randomBytes } = require('crypto');

describe('NodeWebSocket', () => {
    it('creates a new NodeWebSocket', () => {
        const socket = new NodeWebSocket(new FauxSock);
        expect(socket).to.be.instanceOf(NodeWebSocket);
        expect(socket.close()).to.not.throw;
    });

    it('requires a valid URL', () => {
        try {
            const socket = new NodeWebSocket(new FauxSock);
        } catch (error) {
            expect(error.message).to.equal('Invalid URL: fakeURL');
        }
    });

    it('starts out connected', () => {
        const socket = new NodeWebSocket(new FauxSock);
        expect(socket.isConnected).to.be.true;
    });

    it('writes to the socket', () => {
        const socket = new NodeWebSocket(new FauxSock);
        const buff = Buffer.from('hello');
        expect(socket.write(buff)).to.not.throw;
    });

    it('attempts to open a connection', () => {
        const socket = new NodeWebSocket(new FauxSock);
        expect(socket.connect().catch((error) => {
            expect(error.message).to.equal('connect ECONNREFUSED 127.0.0.1:8082');
        }));
    });

    it('can set message handlers on the socket', () => {
        const sock = new FauxSock();
        const socket = new NodeWebSocket(sock);
        expect(sock.dataHandler).to.be.undefined;
        expect(sock._messageHandler).to.be.undefined;
        expect(socket.setOnMessageHandler(() => { })).to.not.throw;
        expect(sock.dataHandler).to.not.be.undefined;
        expect(sock._messageHandler).to.not.be.undefined;
    });

    it('can set error handler on the socket', () => {
        const sock = new FauxSock();
        const socket = new NodeWebSocket(sock);
        expect(sock.errorHandler).to.be.undefined;
        expect(socket.setOnErrorHandler(() => { })).to.not.throw;
        expect(sock.errorHandler).to.not.be.undefined;
    });

    it('can set end handler on the socket', () => {
        const sock = new FauxSock();
        const socket = new NodeWebSocket(sock);
        expect(sock.closeHandler).to.be.undefined;
        expect(socket.setOnCloseHandler(() => { })).to.not.throw;
        expect(sock.closeHandler).to.not.be.undefined;
    });

    it('create() should be successful and set a WebSocket', async () => {
        const sock = new FauxSock();
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
});
