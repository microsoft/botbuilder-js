const { NodeWebSocket, NodeWebSocketFactory } = require('../');
const { FauxSock, TestRequest } = require('./helpers');
const { expect } = require('chai');
const { randomBytes } = require('crypto');

describe('NodeWebSocketFactory', () => {
    it('createWebSocket() should create a new NodeWebSocket', async () => {
        const factory = new NodeWebSocketFactory();
        const sock = new FauxSock();
        const request = new TestRequest();
        request.method = 'GET'; // TODO: Fix TestRequest class
        request.setIsUpgradeRequest(true);
        request.headers = [];
        request.headers['upgrade'] = 'websocket';
        request.headers['sec-websocket-key'] = randomBytes(16).toString('base64');
        request.headers['sec-websocket-version'] = '13';
        request.headers['sec-websocket-protocol'] = '';

        const socket = await factory.createWebSocket(request, sock, Buffer.from([]));
        expect(socket).to.be.instanceOf(NodeWebSocket);
    });
});
