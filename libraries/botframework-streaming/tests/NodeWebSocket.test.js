const { NodeWebSocket } = require('../');
const { expect } = require('chai');
const { FauxSock, TestRequest } = require('./helpers');

describe('NodeSocket', () => {
    it('creates a new NodeSocket', () => {
        const ns = new NodeWebSocket(new FauxSock);
        expect(ns).to.be.instanceOf(NodeWebSocket);
        expect(ns.close()).to.not.be.undefined;
    });

    it('requires a valid URL', () => {
        try {
            const ns = new NodeWebSocket(new FauxSock);
        } catch (error) {
            expect(error.message).to.equal('Invalid URL: fakeURL');
        }
    });

    it('starts out connected', () => {
        const ns = new NodeWebSocket(new FauxSock);
        expect(ns.isConnected).to.be.true;
    });

    it('writes to the socket', () => {
        const ns = new NodeWebSocket(new FauxSock);
        const buff = Buffer.from('hello');
        expect(ns.write(buff)).to.not.throw;
    });

    it('attempts to open a connection', () => {
        const ns = new NodeWebSocket(new FauxSock);
        expect(ns.connect().catch((error) => {
            expect(error.message).to.equal('connect ECONNREFUSED 127.0.0.1:8082');
        }));
    });

    it('can set message handlers on the socket', () => {
        const sock = new FauxSock();
        const ns = new NodeWebSocket(sock);
        expect(sock.textHandler).to.be.undefined;
        expect(sock.binaryHandler).to.be.undefined;
        expect(ns.setOnMessageHandler(() => { })).to.not.throw;
        expect(sock.textHandler).to.not.be.undefined;
        expect(sock.binaryHandler).to.not.be.undefined;
    });

    it('can set error handler on the socket', () => {
        const sock = new FauxSock();
        const ns = new NodeWebSocket(sock);
        expect(sock.errorHandler).to.be.undefined;
        expect(ns.setOnErrorHandler(() => { })).to.not.throw;
        expect(sock.errorHandler).to.not.be.undefined;
    });

    it('can set end handler on the socket', () => {
        const sock = new FauxSock();
        const ns = new NodeWebSocket(sock);
        expect(sock.endHandler).to.be.undefined;
        expect(ns.setOnCloseHandler(() => { })).to.not.throw;
        expect(sock.endHandler).to.not.be.undefined;
    });

    it('create() should be successful and set a WebSocket', () => {
        const sock = new FauxSock();
        const nodeSocket = new NodeWebSocket();
        const request = new TestRequest();
        request.setIsUpgradeRequest(true);
        request.headers = [];
        request.headers['upgrade'] = 'websocket';
        request.headers['sec-websocket-key'] = 'BFlat';
        request.headers['sec-websocket-version'] = '13';
        request.headers['sec-websocket-protocol'] = '';
        nodeSocket.create(request, sock, Buffer.from([]));
        nodeSocket.waterShedSocket.destroy();
    });
});
