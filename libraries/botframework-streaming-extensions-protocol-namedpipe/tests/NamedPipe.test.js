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
    }
    send(buffer){
        return buffer.length;
    };

    receiveAsync(readLength){
        if(this.contentString[this.position])
        {        
            this.buff = new Buffer.from(this.contentString[this.position]);
            this.position++;

            return this.buff.slice(0, readLength);
        }

        if(this.receiver.isConnected)
            this.receiver.disconnect();
    }    
    close(){};
    end(){};

    on(){};

    setReceiver(receiver){
        this.receiver = receiver;
    }
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

        var b = new Buffer('12345', 'utf8');

        let count = c.transport.send(b);

        expect(count).to.equal(0);

        c.disconnect();
        done();
    });

    it('creates a new transport', () => {
        let transport = new np.Transport(new FauxSock, 'fakeSocket');
        expect(transport).to.be.instanceOf(np.Transport);
    });
});

describe('NamedPipe Client Tests', () => {
    it('creates a new client', () => {
        let client = new np.NamedPipeClient('pipeA', new protocol.RequestHandler(), false);
        expect(client).to.be.instanceOf(np.NamedPipeClient);
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
    });
});