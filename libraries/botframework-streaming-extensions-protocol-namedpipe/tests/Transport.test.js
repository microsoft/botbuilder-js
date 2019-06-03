const net = require('net');
const Transport = require('../lib/Transport');

class TestServer {   

    constructor(baseName) {
        let _baseName = undefined;
        let _server = undefined;
        let transport = undefined;

        this._baseName = baseName;
    }

    connect() {
        let pipeName = Transport.PipePath + this._baseName;

        let connectResolve = undefined;

        let result = new Promise((resolve, reject) => {
            connectResolve = resolve;
        });

        this._server = new Server((socket) => {
            this.transport = new Transport(socket, '');
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
        let pipeName = Transport.PipePath + this._baseName;

        let socket = net.netconnect(pipeName);
        this.transport = new Transport(socket, '');

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
        expect(t).toBeDefined();
        c.disconnect();
    });

    it('Client cannot send while connecting', async () => {
        let pipeName = 't1';
        let c = new TestClient(pipeName);
        await c.connect();

        var b = new Buffer('12345', 'utf8');

        let count = c.transport.send(b);

        expect(count).toBe(0);

        c.disconnect();
    });

    it('End to end send and receive', async () => {
        let pipeName = 'ex1';
        let s = new TestServer(pipeName);
        let c = new TestClient(pipeName);

        await connect(s, c);

        var b = new Buffer('12345', 'utf8');

        // send client to server
        let count = c.transport.send(b);
        expect(count).toBe(b.length);

        // receive at server
        let received = await s.transport.receiveAsync(b.length);
        expect(received.length).toBe(b.length);
        expect(received.toString('utf8')).toBe('12345');

        c.disconnect();
        s.disconnect();
    });
});