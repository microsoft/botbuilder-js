const ws = require('../lib');
const { BrowserWebSocket } = require('../browser/index-browser');
const protocol = require('../lib');
const wst = require('../lib/webSocket/webSocketTransport');
const  chai  = require('chai');
const { FauxSock } = require('./helpers');
var expect = chai.expect;

describe('Streaming Extensions WebSocket Library Tests', () => {
    describe('WebSocket Transport Tests', () => {

        it('creates a new transport', () => {
            let sock = new FauxSock();
            let transport = new wst.WebSocketTransport(sock);
            expect(transport).to.be.instanceOf(wst.WebSocketTransport);
            expect( () => transport.close()).to.not.throw;
        });

        it('creates a new transport2', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new wst.WebSocketTransport(sock);
            expect(transport).to.be.instanceOf(wst.WebSocketTransport);
            expect( () => transport.close()).to.not.throw;
        });

        it('creates a new transport and connects', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new wst.WebSocketTransport(sock);
            expect(transport).to.be.instanceOf(wst.WebSocketTransport);
            expect(transport.isConnected).to.be.true;
            expect( () => transport.close()).to.not.throw;
        });

        it('closes the transport without throwing', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new wst.WebSocketTransport(sock);
            expect(transport).to.be.instanceOf(wst.WebSocketTransport);
            expect(transport.close()).to.not.throw;
            expect(transport.isConnected).to.be.false;
        });

        it('writes to the socket', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new wst.WebSocketTransport(sock);
            expect(transport).to.be.instanceOf(wst.WebSocketTransport);
            expect(transport.isConnected).to.be.true;
            let buff = Buffer.from('hello', 'utf8');
            let sent = transport.send(buff);
            expect(sent).to.equal(5);
            expect( () => transport.close()).to.not.throw;
        });

        it('returns 0 when attepmting to write to a closed socket', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new wst.WebSocketTransport(sock);
            expect(transport).to.be.instanceOf(wst.WebSocketTransport);
            expect(transport.isConnected).to.be.true;
            sock.writable = false;
            sock.connected = false;
            let buff = Buffer.from('hello', 'utf8');
            let sent = transport.send(buff);
            expect(sent).to.equal(0);
            expect( () => transport.close()).to.not.throw;
        });

        it('throws when reading from a dead socket', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new wst.WebSocketTransport(sock);
            expect(transport).to.be.instanceOf(wst.WebSocketTransport);
            expect(transport.isConnected).to.be.true;
            expect(transport.receive(5)).to.throw;
            expect( () => transport.close()).to.not.throw;
        });

        it('can read from the socket', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new wst.WebSocketTransport(sock);
            expect(transport).to.be.instanceOf(wst.WebSocketTransport);
            expect(transport.isConnected).to.be.true;
            transport.receive(12).catch();
            transport.onReceive(Buffer.from('{"VERB":"POST", "PATH":"somewhere/something"}', 'utf8'));

            expect( () => transport.close()).to.not.throw;
        });

        it('cleans up when onClose is fired', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new wst.WebSocketTransport(sock);
            expect(transport).to.be.instanceOf(wst.WebSocketTransport);
            expect(transport.isConnected).to.be.true;
            transport.onClose();
            expect(transport._active).to.be.null;
            expect(transport._activeReceiveResolve).to.be.null;
            expect(transport._activeReceiveReject).to.be.null;
            expect(transport._socket).to.be.null;
            expect(transport._activeOffset).to.equal(0);
            expect(transport._activeReceiveCount).to.equal(0);
        });

        it('cleans up when onError is fired', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new wst.WebSocketTransport(sock);
            expect(transport).to.be.instanceOf(wst.WebSocketTransport);
            expect(transport.isConnected).to.be.true;
            transport.onError();
            expect(transport._active).to.be.null;
            expect(transport._activeReceiveResolve).to.be.null;
            expect(transport._activeReceiveReject).to.be.null;
            expect(transport._socket).to.be.null;
            expect(transport._activeOffset).to.equal(0);
            expect(transport._activeReceiveCount).to.equal(0);
        });

        it('does not throw when socketReceive is fired', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new wst.WebSocketTransport(sock);
            expect(transport).to.be.instanceOf(wst.WebSocketTransport);
            expect(transport.isConnected).to.be.true;
            let buff = Buffer.from('hello', 'utf8');
            expect(transport.onReceive(buff)).to.not.throw;
        });


    });

    describe('WebSocket Client Tests', () => {
        it('creates a new client', () => {
            let client = new ws.WebSocketClient('fakeURL', new protocol.RequestHandler());
            expect(client).to.be.instanceOf(ws.WebSocketClient);
            expect(client.disconnect()).to.not.throw;
        });

        it('selects the right websocket and attempts to connect to the transport layer', (done) => {
            let client = new ws.WebSocketClient('fakeURL', new protocol.RequestHandler());
            expect(client).to.be.instanceOf(ws.WebSocketClient);
            client.connect()
                .catch(
                    (err) =>
                    { expect(err.message).to
                        .equal('Unable to connect client to Node transport.');}) //We don't want to really open a connection.
                .then(done());
        });

        it('sends', (done) => {
            let client = new ws.WebSocketClient('fakeURL', new protocol.RequestHandler());
            expect(client).to.be.instanceOf(ws.WebSocketClient);
            let req = new protocol.StreamingRequest();
            req.Verb = 'POST';
            req.Path = 'some/path';
            req.setBody('Hello World!');
            client.send(req).catch(err => {expect(err).to.be.undefined;}).then(done());
        });

        it('disconnects', (done) => {
            let client = new ws.WebSocketClient('fakeURL', new protocol.RequestHandler());
            expect(client).to.be.instanceOf(ws.WebSocketClient);
            expect(client.disconnect()).to.not.throw;
            done();
        });
    });

    describe('WebSocket Server Tests', () => {
        it('creates a new server', () => {
            let server = new ws.WebSocketServer(new FauxSock, new protocol.RequestHandler());
            expect(server).to.be.instanceOf(ws.WebSocketServer);
            expect(server.disconnect()).to.not.throw;
        });

        it('throws a TypeError during construction if missing the "socket" parameter', () => {
            try {
                new ws.WebSocketServer();
            } catch (err) {
                expect(err).to.be.instanceOf(TypeError);
                expect(err.message).to.contain('WebSocketServer: Missing socket parameter');
            }
        });

        it('connects', (done) => {
            let server = new ws.WebSocketServer(new FauxSock, new protocol.RequestHandler());
            expect(server).to.be.instanceOf(ws.WebSocketServer);
            expect(server.start()).to.not.throw;
            done();
        });

        it('sends', (done) => {
            let server = new ws.WebSocketServer(new FauxSock, new protocol.RequestHandler());
            expect(server).to.be.instanceOf(ws.WebSocketServer);
            let req = new protocol.StreamingRequest();
            req.Verb = 'POST';
            req.Path = 'some/path';
            req.setBody('Hello World!');
            server.send(req).catch(err => {expect(err).to.be.undefined;}).then(done());
        });

        it('disconnects', (done) => {
            let server = new ws.WebSocketServer(new FauxSock, new protocol.RequestHandler());
            expect(server).to.be.instanceOf(ws.WebSocketServer);
            expect(server.disconnect()).to.not.throw;
            done();
        });
    });

    describe('BrowserSocket Tests', () => {
        it('creates a new BrowserSocket', () => {
            let bs = new BrowserWebSocket(new FauxSock());
            expect(bs).to.be.instanceOf(BrowserWebSocket);
            expect(() => bs.close()).to.not.throw;
        });

        it('knows its connected', () => {
            let bs = new BrowserWebSocket(new FauxSock());
            bs.connect('fakeUrl');
            expect(bs.isConnected).to.be.true;
        });

        it('writes to the socket', () => {
            let bs = new BrowserWebSocket(new FauxSock());
            let buff = Buffer.from('hello');
            expect(bs.write(buff)).to.not.throw;
        });

        it('always thinks it connects', () => {
            let bs = new BrowserWebSocket(new FauxSock());
            expect(bs.connect()).to.not.throw;
        });

        it('can set error handler on the socket', () => {
            let sock = new FauxSock();
            let bs = new BrowserWebSocket(sock);
            expect(sock.onerror).to.be.undefined;
            expect(bs.setOnErrorHandler(() => {})).to.not.throw;
            expect(sock.onerror).to.not.be.undefined;
        });

        it('can set end handler on the socket', () => {
            let sock = new FauxSock();
            let bs = new BrowserWebSocket(sock);
            expect(sock.onclose).to.be.undefined;
            expect(bs.setOnCloseHandler(() => {})).to.not.throw;
            expect(sock.onclose).to.not.be.undefined;
        });

        it('can set onerror on the socket', () => {
            let sock = new FauxSock();
            let bs = new BrowserWebSocket(sock);
            bs.connect('nowhere');
            expect(sock.onerror).to.not.be.undefined;
            expect(sock.onopen).to.not.be.undefined;
        });

        it('can set onopen on the socket', () => {
            let sock = new FauxSock();
            let bs = new BrowserWebSocket(sock);
            bs.connect('nowhere');
            expect(sock.onerror).to.not.be.undefined;
            expect(sock.onopen).to.not.be.undefined;
        });

        it('can close', () => {
            let sock = new FauxSock();
            let bs = new BrowserWebSocket(sock);
            bs.connect('nowhere');
            expect(sock.onerror).to.not.be.undefined;
            expect(sock.onopen).to.not.be.undefined;
            let sinon = require('sinon');
            let spy = sinon.spy(sock, 'close');
            bs.close();
            expect(spy.called).to.be.true;
        });
    });
});
