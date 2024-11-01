const importSync= require('import-sync');
const { expect } = importSync('chai');
const { FauxSocket, TestRequest } = require('./helpers');
const { NodeWebSocket, NodeWebSocketFactory } = require('..');
const { randomBytes } = require('crypto');

describe('NodeWebSocketFactory', function () {
    it('createWebSocket() should create a new NodeWebSocket', async function () {
        const factory = new NodeWebSocketFactory();
        const sock = new FauxSocket();
        const request = new TestRequest();
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
