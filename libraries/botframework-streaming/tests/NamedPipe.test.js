const assert = require('assert');
const { expect } = require('chai');
const { expectEventually } = require('./helpers/expectEventually');
const { NamedPipeClient, NamedPipeServer, StreamingRequest } = require('../lib');
const { NamedPipeTransport } = require('../lib/namedPipe');
const { platform } = require('os');
const { RequestHandler } = require('../lib');
const { createNodeServer, getServerFactory } = require('../lib/utilities/createNodeServer');

class FauxSock {
    constructor(contentString) {
        if (contentString) {
            this.contentString = contentString;
            this.position = 0;
        }
        this.connecting = false;
        this.exists = true;
    }

    write(buffer) {
        this.buffer = buffer;
    }

    send(buffer) {
        return buffer.length;
    }

    receive(readLength) {
        if (this.contentString[this.position]) {
            this.buff = Buffer.from(this.contentString[this.position]);
            this.position++;

            return this.buff.slice(0, readLength);
        }

        if (this.receiver.isConnected) this.receiver.disconnect();
    }
    close() {}
    end() {
        this.exists = false;
    }
    destroyed() {
        return this.exists;
    }

    setReceiver(receiver) {
        this.receiver = receiver;
    }

    on(action, handler) {
        if (action === 'error') {
            this.errorHandler = handler;
        }
        if (action === 'data') {
            this.messageHandler = handler;
        }
        if (action === 'close') {
            this.closeHandler = handler;
        }
    }
}

class TestClient {
    constructor(baseName) {
        this._baseName = baseName;
    }

    connect() {
        const socket = new FauxSock();
        this.transport = new NamedPipeTransport(socket, '');

        return Promise.resolve();
    }

    disconnect() {
        if (this.transport) {
            this.transport.close();
            this.transport = undefined;
        }
    }
}

// Skips Windows-only tests. Linux does not have named pipes.
describe.windowsOnly = platform() === 'linux' ? describe.skip : describe;

describe.windowsOnly('Streaming Extensions NamedPipe Library Tests', function () {
    describe('NamedPipe Transport Tests', function () {
        it('Client connect', function () {
            const c = new TestClient('pipeName');
            const t = c.connect();
            expect(t).to.not.be.undefined;
            c.disconnect();
        });

        it('Client cannot send while connecting', async function () {
            const c = new TestClient('pipeName');
            c.connect();

            const b = Buffer.from('12345', 'utf8');

            const count = c.transport.send(b);

            expect(count).to.equal(0);

            c.disconnect();
        });

        it('creates a new transport', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new NamedPipeTransport(sock, 'fakeSocket1');
            expect(transport).to.be.instanceOf(NamedPipeTransport);
            expect(() => transport.close()).to.not.throw();
        });

        it('creates a new transport and connects', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new NamedPipeTransport(sock, 'fakeSocket2');
            expect(transport).to.be.instanceOf(NamedPipeTransport);
            expect(transport.isConnected).to.be.true;
            expect(() => transport.close()).to.not.throw();
        });

        it('closes the transport without throwing', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new NamedPipeTransport(sock, 'fakeSocket3');
            expect(transport).to.be.instanceOf(NamedPipeTransport);
            expect(() => transport.close()).to.not.throw();
            expect(transport.isConnected).to.be.false;
        });

        it('writes to the socket', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new NamedPipeTransport(sock, 'fakeSocket4');
            expect(transport).to.be.instanceOf(NamedPipeTransport);
            expect(transport.isConnected).to.be.true;
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
            const transport = new NamedPipeTransport(sock, 'fakeSocket5');
            expect(transport).to.be.instanceOf(NamedPipeTransport);
            expect(transport.isConnected).to.be.true;
            sock.writable = false;
            const buff = Buffer.from('hello', 'utf8');
            const sent = transport.send(buff);
            expect(sent).to.equal(0);
            expect(() => transport.close()).to.not.throw();
        });

        // TODO: 2023-04-24 [hawo] #4462 The code today does not allows the receive() call to be rejected by reading a dead socket.
        //                         The receive() call will be rejected IFF the socket is closed/error AFTER the receive() call.
        it.skip('throws when reading from a dead socket', async function () {
            const sock = new FauxSock();
            sock.destroyed = true;
            sock.connecting = false;
            sock.writable = true;
            const transport = new NamedPipeTransport(sock, 'fakeSocket5');
            expect(transport).to.be.instanceOf(NamedPipeTransport);
            expect(transport.isConnected).to.be.false;
            (await expectEventually(transport.receive(5))).to.throw();
            expect(() => transport.close()).to.not.throw();
        });

        it('can read from the socket', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new NamedPipeTransport(sock);
            expect(transport).to.be.instanceOf(NamedPipeTransport);
            expect(transport.isConnected).to.be.true;
            transport.receive(12).catch();
            transport.socketReceive(Buffer.from('Hello World!', 'utf8'));

            expect(() => transport.close()).to.not.throw();
        });

        it('cleans up when onClose is fired', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new NamedPipeTransport(sock, 'fakeSocket6');
            expect(transport).to.be.instanceOf(NamedPipeTransport);
            expect(transport.isConnected).to.be.true;
            transport.socketClose();
            expect(transport._active).to.be.null;
            expect(transport._activeReceiveResolve).to.be.null;
            expect(transport._activeReceiveReject).to.be.null;
            expect(transport.socket).to.be.null;
            expect(transport._activeOffset).to.equal(0);
            expect(transport._activeReceiveCount).to.equal(0);
        });

        it('cleans up when socketError is fired', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new NamedPipeTransport(sock, 'fakeSocket6');
            expect(transport).to.be.instanceOf(NamedPipeTransport);
            expect(transport.isConnected).to.be.true;
            transport.socketError();
            expect(transport._active).to.be.null;
            expect(transport._activeReceiveResolve).to.be.null;
            expect(transport._activeReceiveReject).to.be.null;
            expect(transport.socket).to.be.null;
            expect(transport._activeOffset).to.equal(0);
            expect(transport._activeReceiveCount).to.equal(0);
        });

        it('does not throw when socketReceive is fired', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new NamedPipeTransport(sock, 'fakeSocket6');
            expect(transport).to.be.instanceOf(NamedPipeTransport);
            expect(transport.isConnected).to.be.true;
            const buff = Buffer.from('hello', 'utf8');
            expect(() => transport.socketReceive(buff)).to.not.throw();
        });
    });

    describe('NamedPipe Client Tests', function () {
        const client = new NamedPipeClient('pipeA', new RequestHandler(), false);

        it('creates a new client', function () {
            expect(client).to.be.instanceOf(NamedPipeClient);
            expect(() => client.disconnect()).to.not.throw();
        });

        it('connects without throwing', function () {
            expect(() => client.connect()).to.not.throw();
            expect(() => client.disconnect()).to.not.throw();
        });

        it('disconnects without throwing', function () {
            expect(() => client.disconnect()).to.not.throw();
        });

        // TODO: 2023-04-24 [hawo] #4462 The client.send() call will only resolve when the other side responded.
        //                         Because the other side is not connected to anything, thus, no response is received.
        //                         Thus, the Promise is not resolved.
        it.skip('sends without throwing', function (done) {
            const req = new StreamingRequest();
            req.Verb = 'POST';
            req.Path = 'some/path';
            req.setBody('Hello World!');
            client
                .send(req)
                .catch((err) => {
                    expect(err).to.be.undefined;
                })
                .then(done);
        });
    });

    describe('NamedPipe Server Tests', function () {
        it('creates a new server', function () {
            const server = new NamedPipeServer('pipeA', new RequestHandler());
            expect(server).to.be.instanceOf(NamedPipeServer);
            expect(() => server.disconnect()).to.not.throw();
        });

        it('throws a TypeError during construction if missing the "baseName" parameter', function () {
            expect(() => new NamedPipeServer()).to.throw('NamedPipeServer: Missing baseName parameter');
        });

        it('starts the server without throwing', function () {
            const server = new NamedPipeServer('pipeA', new RequestHandler());
            expect(server).to.be.instanceOf(NamedPipeServer);

            expect(() => server.start()).to.not.throw();
            expect(() => server.disconnect()).to.not.throw();
        });

        it('disconnects without throwing', function () {
            const server = new NamedPipeServer('pipeA', new RequestHandler());
            expect(server).to.be.instanceOf(NamedPipeServer);
            expect(() => server.start()).to.not.throw();
            expect(() => server.disconnect()).to.not.throw();
        });

        it('returns true if isConnected === true on _receiver & _sender', function () {
            const server = new NamedPipeServer('pipeisConnected', new RequestHandler());

            expect(server.isConnected).to.be.false;
            server._receiver = { isConnected: true };
            server._sender = { isConnected: true };
            expect(server.isConnected).to.be.true;
        });

        // TODO: 2023-04-24 [hawo] #4462 The client.send() call will only resolve when the other side responded.
        //                         Because the other side is not connected to anything, thus, no response is received.
        //                         Thus, the Promise is not resolved.
        it.skip('sends without throwing', function (done) {
            const server = new NamedPipeServer('pipeA', new RequestHandler());
            expect(server).to.be.instanceOf(NamedPipeServer);
            expect(() => server.start()).to.not.throw();
            const req = { verb: 'POST', path: '/api/messages', streams: [] };
            server
                .send(req)
                .catch((err) => {
                    expect(err).to.be.undefined;
                })
                .then(expect(() => server.disconnect()).to.not.throw())
                .then(done);
        });

        it('handles being disconnected', function () {
            const server = new NamedPipeServer('pipeA', new RequestHandler());
            expect(server).to.be.instanceOf(NamedPipeServer);
            server.start();
            expect(() => server.disconnect()).to.not.throw();
        });

        it('ensures that two servers cannot get into a split brain scenario', async function () {
            const servers = [
                new NamedPipeServer('pipeA', new RequestHandler()),
                new NamedPipeServer('pipeA', new RequestHandler()),
            ];

            try {
                await assert.rejects(
                    Promise.all(
                        servers.map(async (server) => {
                            // introduce jitter which should _not_ matter since we acquire sockets sequentially
                            await new Promise((resolve) => setTimeout(resolve, Math.ceil(Math.random() * 10) + 10));

                            // start up server, taking care to attach server to thrown errors for later inspection
                            try {
                                await new Promise((resolve, reject) => server.start(resolve).catch(reject));
                            } catch (err) {
                                err.server = server;
                                throw err;
                            }
                        })
                    ),
                    (err) => {
                        // Verify we did get an addr in use error
                        assert(err.message.indexOf('listen EADDRINUSE: address already in use') === 0);

                        assert(err.server, 'server attached to error');
                        assert(
                            err.server._incomingServer && !err.server._incomingServer.listening,
                            'incoming server attached but not listening'
                        );
                        assert(!err.server._outgoingServer, 'no outgoing server attached');

                        return true;
                    }
                );
            } finally {
                servers.forEach((server) => server.disconnect());
            }
        });

        it("calling createNodeServer() should throw if passing in a callback that's not a function", function () {
            const stringCallback = 'Not a real callback function.';
            expect(() => createNodeServer(stringCallback)).to.throw(TypeError);
        });

        it('should not throw when choosing not to pass in a callback at all into createNodeServer()', function () {
            expect(() => createNodeServer()).to.not.throw();
        });

        it('should return a Server when calling createNodeServer()', function () {
            const server = createNodeServer();
            expect(server).to.not.be.null;
            expect(server).to.be.instanceOf(Object);
            expect(typeof server.listen).to.equal('function');
            expect(typeof server.close).to.equal('function');
        });

        it('should return the factory when calling getServerFactory()', function () {
            expect(() => getServerFactory()).to.not.throw();
            const serverFactoryFunction = getServerFactory();
            expect(serverFactoryFunction).to.not.be.null;
            expect(typeof serverFactoryFunction).to.equal('function');
        });

        it("should throw if the callback isn't a valid connection listener callback", function () {
            const callback = 'not a function';
            const serverFactory = getServerFactory();
            expect(() => serverFactory(callback)).to.throw();
        });
    });
});
