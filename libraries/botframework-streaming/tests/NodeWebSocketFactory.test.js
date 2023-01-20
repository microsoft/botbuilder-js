const { expect } = require('chai');
const { NodeWebSocket, NodeWebSocketFactory } = require('..');
const { randomBytes } = require('crypto');
const { Socket } = require('net');
const { TestRequest } = require('./helpers');

describe('NodeWebSocketFactory', function () {
    it('createWebSocket() should create a new NodeWebSocket', async function () {
        const factory = new NodeWebSocketFactory();
        const sock = new Socket();
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
