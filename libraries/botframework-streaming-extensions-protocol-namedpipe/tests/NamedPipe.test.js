const net = require('net');
const np = require('../lib');
const protocol = require('botframework-streaming-extensions-protocol');
const  chai  = require('chai');
var expect = chai.expect;

class FauxSock{
    constructor(contentString){
        if(contentString){
            this.contentString = contentString;
            this.position = 0;
        }
        this.connecting = false;
        this.exists = true;       
    }

    write(buffer){
        this.buffer = buffer;
    }

    send(buffer){
        return buffer.length;
    };

    receiveAsync(readLength){
        if(this.contentString[this.position])
        {        
            this.buff = Buffer.from(this.contentString[this.position]);
            this.position++;

            return this.buff.slice(0, readLength);
        }

        if(this.receiver.isConnected)
            this.receiver.disconnect();
    }    
    close(){};
    end(){ 
        this.exists = false;
    };
    destroyed(){ 
        return this.exists;
    };

    setReceiver(receiver){
        this.receiver = receiver;
    }

    on(action, handler){
        if(action === 'error'){
            this.errorHandler = handler;
        }
        if(action === 'data'){
            this.messageHandler = handler;
        }
        if(action === 'close'){
            this.closeHandler = handler;
        }
        
    };
}
class TestServer {
    constructor(baseName) {
        let _baseName = undefined;
        let _server = undefined;
        let transport = undefined;

        this._baseName = baseName;
    }

    connect() {
        let pipeName = np.Transport.PipePath + this._baseName;

        let connectResolve = undefined;

        let result = new Promise((resolve, reject) => {
            connectResolve = resolve;
        });

        this._server = net.createServer(() => {
            this.transport = new np.Transport(new FauxSock , pipeName);
            connectResolve();
        });
        this._server.listen(pipeName);

        return result;
    }

    disconnect() {
        if (this.transport) {
            this.transport.close();
            this.transport = undefined;
        }

        if (this._server) {
            this._server.close();
            this._server = undefined;
        }
    }
}

class TestClient {
    

    constructor(baseName) {
        let _baseName = undefined;
        let transport = undefined;

        this._baseName = baseName;
    }

    connect() {
        let pipeName = np.Transport.PipePath + this._baseName;

        let socket = new FauxSock;
        this.transport = new np.Transport(socket, '');

        return Promise.resolve();
    }

    disconnect() {
        if (this.transport) {
            this.transport.close();
            this.transport = undefined;
        }
    }
}

function connect(s, c) {
    var p = new Promise((resolve, reject) => {
        var clientConnected = false;
        var serverConnected = false;

        s.connect().then(() => {
            serverConnected = true;
            if (clientConnected && serverConnected) {
                resolve(true);
            }
        });

        c.connect().then(() => {
            clientConnected = true;
            if (clientConnected && serverConnected) {
                resolve(true);
            }
        });
    });

    return p;
}

describe('Streaming Extensions NamedPipe Library Tests', () => {
    describe('NamedPipe Transport Tests', () => {
        it('Client connect', () => {
            let pipeName = 't1';
            let c = new TestClient(pipeName);
            let t = c.connect();
            expect(t).to.not.be.undefined;
            c.disconnect();
        });

        it('Client cannot send while connecting', async (done) => {
            let pipeName = 't1';
            let c = new TestClient(pipeName);
            c.connect();

            var b = Buffer.from('12345', 'utf8');

            let count = c.transport.send(b);

            expect(count).to.equal(0);

            c.disconnect();
            done();
        });

        it('creates a new transport', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new np.Transport(sock, 'fakeSocket1');
            expect(transport).to.be.instanceOf(np.Transport);
            expect( () => transport.close()).to.not.throw;
        });

        it('creates a new transport and connects', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new np.Transport(sock, 'fakeSocket2');
            expect(transport).to.be.instanceOf(np.Transport);
            expect(transport.isConnected()).to.be.true;
            expect( () => transport.close()).to.not.throw;
        });

        it('closes the transport without throwing', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new np.Transport(sock, 'fakeSocket3');
            expect(transport).to.be.instanceOf(np.Transport);
            expect( transport.close()).to.not.throw;
            let exists = transport.isConnected();
            expect(exists).to.be.false;
        });

        it('writes to the socket', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new np.Transport(sock, 'fakeSocket4');
            expect(transport).to.be.instanceOf(np.Transport);
            expect(transport.isConnected()).to.be.true;
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
            let transport = new np.Transport(sock, 'fakeSocket5');
            expect(transport).to.be.instanceOf(np.Transport);
            expect(transport.isConnected()).to.be.true;
            sock.writable = false;
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
            let transport = new np.Transport(sock, 'fakeSocket5');
            expect(transport).to.be.instanceOf(np.Transport);
            expect(transport.isConnected()).to.be.true;
            expect(transport.receiveAsync(5)).to.throw;
            expect( () => transport.close()).to.not.throw;
        });

        
        it('cleans up when onClose is fired', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new np.Transport(sock, 'fakeSocket6');
            expect(transport).to.be.instanceOf(np.Transport);
            expect(transport.isConnected()).to.be.true;
            transport.socketClose();
            expect(transport._active).to.be.undefined;
            expect(transport._activeReceiveResolve).to.be.undefined;
            expect(transport._activeReceiveReject).to.be.undefined;
            expect(transport._socket).to.be.undefined;
            expect(transport._activeOffset).to.equal(0);
            expect(transport._activeReceiveCount).to.equal(0);
        });

        it('cleans up when socketError is fired', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new np.Transport(sock, 'fakeSocket6');
            expect(transport).to.be.instanceOf(np.Transport);
            expect(transport.isConnected()).to.be.true;
            transport.socketError();
            expect(transport._active).to.be.undefined;
            expect(transport._activeReceiveResolve).to.be.undefined;
            expect(transport._activeReceiveReject).to.be.undefined;
            expect(transport._socket).to.be.undefined;
            expect(transport._activeOffset).to.equal(0);
            expect(transport._activeReceiveCount).to.equal(0);
        });

        it('does not throw when socketReceive is fired', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new np.Transport(sock, 'fakeSocket6');
            expect(transport).to.be.instanceOf(np.Transport);
            expect(transport.isConnected()).to.be.true;
            let buff = Buffer.from('hello', 'utf8');
            expect(transport.socketReceive(buff)).to.not.throw;
        });
    });

    describe('NamedPipe Client Tests', () => {
        it('creates a new client', () => {
            let client = new np.NamedPipeClient('pipeA', new protocol.RequestHandler(), false);
            expect(client).to.be.instanceOf(np.NamedPipeClient);
            expect(client.disconnect()).to.not.throw;
        });

        it('connects without throwing', () => {
            let client = new np.NamedPipeClient('pipeA', new protocol.RequestHandler(), false);
            expect(client.connectAsync()).to.not.throw;
            expect(client.disconnect()).to.not.throw;
        });

        it('disconnects without throwing', () => {
            let client = new np.NamedPipeClient('pipeA', new protocol.RequestHandler(), false);
            expect(client.disconnect()).to.not.throw;
        });

        it('sends without throwing', () => {
            let client = new np.NamedPipeClient('pipeA', new protocol.RequestHandler(), false);
            let request = new protocol.Request();
            let token = new protocol.CancellationToken();
            expect( () => client.sendAsync(request, token)).to.not.throw;
            expect(client.disconnect()).to.not.throw;
        });

    });

    describe('NamedPipe Server Tests', () => {

        it('creates a new server', () => {
            let server = new np.NamedPipeServer('pipeA', new protocol.RequestHandler(), false);
            expect(server).to.be.instanceOf(np.NamedPipeServer);
            expect(() => server.disconnect()).to.not.throw;
        });

        it('starts the server without throwing', () => {
            let server = new np.NamedPipeServer('pipeA', new protocol.RequestHandler(), false);
            expect(server).to.be.instanceOf(np.NamedPipeServer);

            expect( () => server.startAsync()).to.not.throw;
            expect(() => server.disconnect()).to.not.throw;
        });

        it('disconnects without throwing', () => {
            let server = new np.NamedPipeServer('pipeA', new protocol.RequestHandler(), false);
            expect(server).to.be.instanceOf(np.NamedPipeServer);
            expect( () => server.startAsync()).to.not.throw;
            expect(() => server.disconnect()).to.not.throw;
        });

        it('sends without throwing', () => {
            let server = new np.NamedPipeServer('pipeA', new protocol.RequestHandler(), false);
            expect(server).to.be.instanceOf(np.NamedPipeServer);
            expect( () => server.startAsync()).to.not.throw;
            expect(() => server.sendAsync(new protocol.Request(), new protocol.CancellationToken()));
            expect(() => server.disconnect()).to.not.throw;
        });

    });
});