const { WsNodeWebSocket } = require('../');
const { expect } = require('chai');
const { FauxSock, TestRequest } = require('./helpers');
const { randomBytes } = require('crypto');

describe('WsNodeWebSocket', () => {
    it('creates a new WsNodeWebSocket', () => {
        const wsSocket = new WsNodeWebSocket(new FauxSock);
        expect(wsSocket).to.be.instanceOf(WsNodeWebSocket);
        expect(wsSocket.close()).to.not.throw;
    });

    it('requires a valid URL', () => {
        try {
            const wsSocket = new WsNodeWebSocket(new FauxSock);
        } catch (error) {
            expect(error.message).to.equal('Invalid URL: fakeURL');
        }
    });

    it('starts out connected', () => {
        const wsSocket = new WsNodeWebSocket(new FauxSock);
        expect(wsSocket.isConnected).to.be.true;
    });

    it('writes to the socket', () => {
        const wsSocket = new WsNodeWebSocket(new FauxSock);
        const buff = Buffer.from('hello');
        expect(wsSocket.write(buff)).to.not.throw;
    });

    it('attempts to open a connection', () => {
        const wsSocket = new WsNodeWebSocket(new FauxSock);
        expect(wsSocket.connect().catch((error) => {
            expect(error.message).to.equal('connect ECONNREFUSED 127.0.0.1:8082');
        }));
    });

    it('can set message handlers on the socket', () => {
        const sock = new FauxSock();
        const wsSocket = new WsNodeWebSocket(sock);
        expect(sock.dataHandler).to.be.undefined;
        expect(sock._messageHandler).to.be.undefined;
        expect(wsSocket.setOnMessageHandler(() => { })).to.not.throw;
        expect(sock.dataHandler).to.not.be.undefined;
        expect(sock._messageHandler).to.not.be.undefined;
    });

    it('can set error handler on the socket', () => {
        const sock = new FauxSock();
        const wsSocket = new WsNodeWebSocket(sock);
        expect(sock.errorHandler).to.be.undefined;
        expect(wsSocket.setOnErrorHandler(() => { })).to.not.throw;
        expect(sock.errorHandler).to.not.be.undefined;
    });

    it('can set end handler on the socket', () => {
        const sock = new FauxSock();
        const wsSocket = new WsNodeWebSocket(sock);
        expect(sock.closeHandler).to.be.undefined;
        expect(wsSocket.setOnCloseHandler(() => { })).to.not.throw;
        expect(sock.closeHandler).to.not.be.undefined;
    });

    it('create() should be successful and set a WebSocket', async () => {
        const sock = new FauxSock();
        const nodeSocket = new WsNodeWebSocket();
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
