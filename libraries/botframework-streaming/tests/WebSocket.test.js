const { expect } = require('chai');
const { spy } = require('sinon');

const { BrowserWebSocket } = require('../lib/index-browser');
const { WebSocketTransport } = require('../lib/webSocket/webSocketTransport');

const { expectEventually, FauxSock } = require('./helpers');

describe('Streaming Extensions WebSocket Library Tests', function () {
    describe('WebSocket Transport Tests', function () {
        it('creates a new transport', function () {
            const sock = new FauxSock();
            const transport = new WebSocketTransport(sock);
            expect(transport).to.be.instanceOf(WebSocketTransport);
            expect(() => transport.close()).to.not.throw();
        });

        it('creates a new transport with modified state', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new WebSocketTransport(sock);
            expect(transport).to.be.instanceOf(WebSocketTransport);
            expect(() => transport.close()).to.not.throw();
        });

        it('creates a new transport and connects', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new WebSocketTransport(sock);
            expect(transport).to.be.instanceOf(WebSocketTransport);
            expect(transport.isConnected).to.equal(true);
            expect(() => transport.close()).to.not.throw();
        });

        it('closes the transport without throwing', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new WebSocketTransport(sock);
            expect(() => transport.close()).to.not.throw();
            expect(transport.isConnected).to.equal(false);
        });

        it('writes to the socket', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new WebSocketTransport(sock);
            expect(transport.isConnected).to.equal(true);
            const buff = Buffer.from('hello', 'utf8');
            const sent = transport.send(buff);
            expect(sent).to.equal(5);
            expect(() => transport.close()).to.not.throw();
        });

        it('returns 0 when attempting to write to a closed socket', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new WebSocketTransport(sock);
            expect(transport.isConnected).to.equal(true);
            sock.writable = false;
            sock.connected = false;
            const buff = Buffer.from('hello', 'utf8');
            const sent = transport.send(buff);
            expect(sent).to.equal(0);
            expect(() => transport.close()).to.not.throw();
        });

        it('throws when reading from a dead socket', async function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new WebSocketTransport(sock);
            expect(transport.isConnected).to.equal(true);
            const promise = transport.receive(5);
            expect(() => transport.close()).to.not.throw();
            (await expectEventually(promise)).to.throw('Socket was closed.');
        });

        it('can read from the socket', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new WebSocketTransport(sock);
            expect(transport.isConnected).to.equal(true);
            transport.receive(12).catch();
            transport.onReceive(Buffer.from('{"VERB":"POST", "PATH":"somewhere/something"}', 'utf8'));

            expect(() => transport.close()).to.not.throw();
        });

        it('cleans up when onClose is fired', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new WebSocketTransport(sock);
            expect(transport.isConnected).to.equal(true);
            transport.onClose();
            expect(transport._active).to.equal(null);
            expect(transport._activeReceiveResolve).to.equal(null);
            expect(transport._activeReceiveReject).to.equal(null);
            expect(transport.ws).to.equal(null);
            expect(transport._activeOffset).to.equal(0);
            expect(transport._activeReceiveCount).to.equal(0);
        });

        it('cleans up when onError is fired', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new WebSocketTransport(sock);
            expect(transport.isConnected).to.equal(true);
            transport.onError();
            expect(transport._active).to.equal(null);
            expect(transport._activeReceiveResolve).to.equal(null);
            expect(transport._activeReceiveReject).to.equal(null);
            expect(transport.ws).to.equal(null);
            expect(transport._activeOffset).to.equal(0);
            expect(transport._activeReceiveCount).to.equal(0);
        });

        it('does not throw when socketReceive is fired', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new WebSocketTransport(sock);
            expect(transport.isConnected).to.equal(true);
            const buff = Buffer.from('hello', 'utf8');
            expect(() => transport.onReceive(buff)).to.not.throw();
        });
    });

    describe('BrowserSocket Tests', function () {
        it('creates a new BrowserSocket', function () {
            const bs = new BrowserWebSocket(new FauxSock());
            expect(bs).to.be.instanceOf(BrowserWebSocket);
            expect(() => bs.close()).to.not.throw();
        });

        it('knows its connected', function () {
            const bs = new BrowserWebSocket(new FauxSock());
            bs.connect('fakeUrl');
            expect(bs.isConnected).to.equal(true);
        });

        it('writes to the socket', function () {
            const bs = new BrowserWebSocket(new FauxSock());
            const buff = Buffer.from('hello');
            expect(() => bs.write(buff)).to.not.throw();
        });

        it('always thinks it connects', function () {
            const bs = new BrowserWebSocket(new FauxSock());
            expect(() => bs.connect()).to.not.throw();
        });

        it('can set error handler on the socket', function () {
            const sock = new FauxSock();
            const bs = new BrowserWebSocket(sock);
            expect(sock.onerror).to.equal(undefined);
            expect(() => bs.setOnErrorHandler(() => {})).to.not.throw();
            expect(sock.onerror).to.not.equal(undefined);
        });

        it('can set end handler on the socket', function () {
            const sock = new FauxSock();
            const bs = new BrowserWebSocket(sock);
            expect(sock.onclose).to.equal(undefined);
            expect(() => bs.setOnCloseHandler(() => {})).to.not.throw();
            expect(sock.onclose).to.not.equal(undefined);
        });

        it('can set onerror on the socket', function () {
            const sock = new FauxSock();
            const bs = new BrowserWebSocket(sock);
            bs.connect('nowhere');
            expect(sock.onerror).to.not.equal(undefined);
            expect(sock.onopen).to.not.equal(undefined);
        });

        it('can set onopen on the socket', function () {
            const sock = new FauxSock();
            const bs = new BrowserWebSocket(sock);
            bs.connect('nowhere');
            expect(sock.onerror).to.not.equal(undefined);
            expect(sock.onopen).to.not.equal(undefined);
        });

        it('can close', function () {
            const sock = new FauxSock();
            const bs = new BrowserWebSocket(sock);
            bs.connect('nowhere');
            expect(sock.onerror).to.not.equal(undefined);
            expect(sock.onopen).to.not.equal(undefined);

            const closeSpy = spy(sock, 'close');
            bs.close();
            expect(closeSpy.called).to.equal(true);
        });
    });
});
