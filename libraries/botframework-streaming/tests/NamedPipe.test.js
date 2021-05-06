const np = require('../lib');
const npt = require('../lib/namedPipe/namedPipeTransport');
const { createNodeServer, getServerFactory } = require('../lib/utilities/createNodeServer');
const protocol = require('../lib');
const chai = require('chai');
const expect = chai.expect;

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
        this.transport = new npt.NamedPipeTransport(socket, '');

        return Promise.resolve();
    }

    disconnect() {
        if (this.transport) {
            this.transport.close();
            this.transport = undefined;
        }
    }
}

describe('Streaming Extensions NamedPipe Library Tests', function () {
    describe('NamedPipe Transport Tests', function () {
        it('Client connect', function () {
            const pipeName = 't1';
            const c = new TestClient(pipeName);
            const t = c.connect();
            expect(t).to.not.be.undefined;
            c.disconnect();
        });

        it('Client cannot send while connecting', async function (done) {
            const pipeName = 't1';
            const c = new TestClient(pipeName);
            c.connect();

            const b = Buffer.from('12345', 'utf8');

            const count = c.transport.send(b);

            expect(count).to.equal(0);

            c.disconnect();
            done();
        });

        it('creates a new transport', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new npt.NamedPipeTransport(sock, 'fakeSocket1');
            expect(transport).to.be.instanceOf(npt.NamedPipeTransport);
            expect(() => transport.close()).to.not.throw;
        });

        it('creates a new transport and connects', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new npt.NamedPipeTransport(sock, 'fakeSocket2');
            expect(transport).to.be.instanceOf(npt.NamedPipeTransport);
            expect(transport.isConnected).to.be.true;
            expect(() => transport.close()).to.not.throw;
        });

        it('closes the transport without throwing', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new npt.NamedPipeTransport(sock, 'fakeSocket3');
            expect(transport).to.be.instanceOf(npt.NamedPipeTransport);
            expect(transport.close()).to.not.throw;
            expect(transport.isConnected).to.be.false;
        });

        it('writes to the socket', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new npt.NamedPipeTransport(sock, 'fakeSocket4');
            expect(transport).to.be.instanceOf(npt.NamedPipeTransport);
            expect(transport.isConnected).to.be.true;
            const buff = Buffer.from('hello', 'utf8');
            const sent = transport.send(buff);
            expect(sent).to.equal(5);
            expect(() => transport.close()).to.not.throw;
        });

        it('returns 0 when attempting to write to a closed socket', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new npt.NamedPipeTransport(sock, 'fakeSocket5');
            expect(transport).to.be.instanceOf(npt.NamedPipeTransport);
            expect(transport.isConnected).to.be.true;
            sock.writable = false;
            const buff = Buffer.from('hello', 'utf8');
            const sent = transport.send(buff);
            expect(sent).to.equal(0);
            expect(() => transport.close()).to.not.throw;
        });

        it('throws when reading from a dead socket', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new npt.NamedPipeTransport(sock, 'fakeSocket5');
            expect(transport).to.be.instanceOf(npt.NamedPipeTransport);
            expect(transport.isConnected).to.be.true;
            expect(transport.receive(5)).to.throw;
            expect(() => transport.close()).to.not.throw;
        });

        it('can read from the socket', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new npt.NamedPipeTransport(sock);
            expect(transport).to.be.instanceOf(npt.NamedPipeTransport);
            expect(transport.isConnected).to.be.true;
            transport.receive(12).catch();
            transport.socketReceive(Buffer.from('Hello World!', 'utf8'));

            expect(() => transport.close()).to.not.throw;
        });

        it('cleans up when onClose is fired', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new npt.NamedPipeTransport(sock, 'fakeSocket6');
            expect(transport).to.be.instanceOf(npt.NamedPipeTransport);
            expect(transport.isConnected).to.be.true;
            transport.socketClose();
            expect(transport._active).to.be.null;
            expect(transport._activeReceiveResolve).to.be.null;
            expect(transport._activeReceiveReject).to.be.null;
            expect(transport._socket).to.be.null;
            expect(transport._activeOffset).to.equal(0);
            expect(transport._activeReceiveCount).to.equal(0);
        });

        it('cleans up when socketError is fired', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new npt.NamedPipeTransport(sock, 'fakeSocket6');
            expect(transport).to.be.instanceOf(npt.NamedPipeTransport);
            expect(transport.isConnected).to.be.true;
            transport.socketError();
            expect(transport._active).to.be.null;
            expect(transport._activeReceiveResolve).to.be.null;
            expect(transport._activeReceiveReject).to.be.null;
            expect(transport._socket).to.be.null;
            expect(transport._activeOffset).to.equal(0);
            expect(transport._activeReceiveCount).to.equal(0);
        });

        it('does not throw when socketReceive is fired', function () {
            const sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            const transport = new npt.NamedPipeTransport(sock, 'fakeSocket6');
            expect(transport).to.be.instanceOf(npt.NamedPipeTransport);
            expect(transport.isConnected).to.be.true;
            const buff = Buffer.from('hello', 'utf8');
            expect(transport.socketReceive(buff)).to.not.throw;
        });
    });

    describe('NamedPipe Client Tests', function () {
        const client = new np.NamedPipeClient('pipeA', new protocol.RequestHandler(), false);

        it('creates a new client', function () {
            expect(client).to.be.instanceOf(np.NamedPipeClient);
            expect(client.disconnect()).to.not.throw;
        });

        it('connects without throwing', function () {
            expect(client.connect()).to.not.throw;
            expect(client.disconnect()).to.not.throw;
        });

        it('disconnects without throwing', function () {
            expect(client.disconnect()).to.not.throw;
        });

        it('sends without throwing', function (done) {
            const req = new protocol.StreamingRequest();
            req.Verb = 'POST';
            req.Path = 'some/path';
            req.setBody('Hello World!');
            client
                .send(req)
                .catch((err) => {
                    expect(err).to.be.undefined;
                })
                .then(done());
        });
    });

    describe('NamedPipe Server Tests', function () {
        it('creates a new server', function () {
            const server = new np.NamedPipeServer('pipeA', new protocol.RequestHandler(), false);
            expect(server).to.be.instanceOf(np.NamedPipeServer);
            expect(server.disconnect()).to.not.throw;
        });

        it('throws a TypeError during construction if missing the "baseName" parameter', function () {
            expect(() => new np.NamedPipeServer()).to.throw('NamedPipeServer: Missing baseName parameter');
        });

        it('starts the server without throwing', function () {
            const server = new np.NamedPipeServer('pipeA', new protocol.RequestHandler(), false);
            expect(server).to.be.instanceOf(np.NamedPipeServer);

            expect(server.start()).to.not.throw;
            expect(server.disconnect()).to.not.throw;
        });

        it('disconnects without throwing', function () {
            const server = new np.NamedPipeServer('pipeA', new protocol.RequestHandler(), false);
            expect(server).to.be.instanceOf(np.NamedPipeServer);
            expect(server.start()).to.not.throw;
            expect(server.disconnect()).to.not.throw;
        });

        it('returns true if isConnected === true on _receiver & _sender', function () {
            const server = new np.NamedPipeServer('pipeisConnected', new protocol.RequestHandler(), false);

            expect(server.isConnected).to.be.false;
            server._receiver = { isConnected: true };
            server._sender = { isConnected: true };
            expect(server.isConnected).to.be.true;
        });

        it('sends without throwing', function (done) {
            const server = new np.NamedPipeServer('pipeA', new protocol.RequestHandler(), false);
            expect(server).to.be.instanceOf(np.NamedPipeServer);
            expect(server.start()).to.not.throw;
            const req = { verb: 'POST', path: '/api/messages', streams: [] };
            server
                .send(req)
                .catch((err) => {
                    expect(err).to.be.undefined;
                })
                .then(expect(server.disconnect()).to.not.throw)
                .then(done());
        });

        it('handles being disconnected', function (done) {
            const server = new np.NamedPipeServer('pipeA', new protocol.RequestHandler(), false);
            expect(server).to.be.instanceOf(np.NamedPipeServer);
            server.start();
            try {
                server.onConnectionDisconnected();
            } catch (err) {
                expect(err).to.equal(`address already in use \\.\pipe\pipeA.incoming`);
            }
            expect(server.disconnect()).to.not.throw;
            done();
        });

        it('handles being disconnected and tries to reconnect', function (done) {
            const server = new np.NamedPipeServer('pipeA', new protocol.RequestHandler(), true);
            expect(server).to.be.instanceOf(np.NamedPipeServer);
            server.start();
            try {
                server.onConnectionDisconnected();
            } catch (err) {
                expect(err).to.equal(`address already in use \\.\pipe\pipeA.incoming`);
            }
            expect(server.disconnect()).to.not.throw;
            done();
        });

        it("calling createNodeServer() should throw if passing in a callback that's not a function", function () {
            const stringCallback = 'Not a real callback function.';
            expect(() => createNodeServer(stringCallback)).to.throw(TypeError);
        });

        it('should not throw when choosing not to pass in a callback at all into createNodeServer()', function () {
            expect(() => createNodeServer()).to.not.throw;
        });

        it('should return a Server when calling createNodeServer()', function () {
            const server = createNodeServer();
            expect(server).to.not.throw;
            expect(server).to.not.be.null;
            expect(server).to.be.instanceOf(Object);
            expect(typeof server.listen).to.equal('function');
            expect(typeof server.close).to.equal('function');
        });

        it('should return the factory when calling getServerFactory()', function () {
            expect(getServerFactory()).to.not.throw;
            const serverFactoryFunction = getServerFactory();
            expect(serverFactoryFunction).to.not.be.null;
            expect(typeof serverFactoryFunction).to.equal('function');
        });

        it("should throw if the callback isn't a valid connection listener callback", function () {
            const callback = () => {};
            const serverFactory = getServerFactory();
            expect(serverFactory(callback)).to.throw;
        });
    });
});
