const { NodeWebSocket, NodeWebSocketFactory } = require('../');
const { FauxSock, TestRequest } = require('./helpers');
const { expect } = require('chai');

describe('NodeWebSocketFactory', () => {
    it('createWebSocket() should create a new NodeWebSocket', () => {
        const factory = new NodeWebSocketFactory();
        const sock = new FauxSock();
        const request = new TestRequest();

        request.setIsUpgradeRequest(true);
        request.headers = [];
        request.headers['upgrade'] = 'websocket';
        request.headers['sec-websocket-key'] = 'BFlat';
        request.headers['sec-websocket-version'] = '13';
        request.headers['sec-websocket-protocol'] = '';

        const socket = factory.createWebSocket(request, sock, Buffer.from([]));
        expect(socket).to.be.instanceOf(NodeWebSocket);
        socket.waterShedSocket.destroy();
    });
});
