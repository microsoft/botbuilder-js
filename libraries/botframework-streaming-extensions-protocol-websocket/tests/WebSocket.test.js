const ws = require('../lib');
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
        this.connected = true;
        this.readyState = 1;
        this.exists = true;       

        this.onmessage = undefined;
        this.onerror = undefined;
        this.onclose = undefined;
    }

    isConnected(){
        return this.connected;
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
    closeAsync(){
        this.connected = false;
    };
    end(){ 
        this.exists = false;
        return true;
    };
    destroyed(){ 
        return this.exists;
    };
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
        if(action === 'text'){
            this.textHandler = handler;
        }
        if(action === 'binary'){
            this.binaryHandler = handler;
        }
        if(action === 'end'){
            this.endHandler = handler;
        }          
    };



    setReceiver(receiver){
        this.receiver = receiver;
    }

    setOnMessageHandler(handler){
        this.messageHandler = handler;
    };
    setOnErrorHandler(handler){
        this.errorHandler = handler;
    };
    setOnCloseHandler(handler){
        this.closeHandler = handler;
    };
}

describe('Streaming Extensions WebSocket Library Tests', () => {
    describe('WebSocket Transport Tests', () => {

        it('creates a new transport', () => {
            let sock = new FauxSock();
            let transport = new ws.Transport(sock);
            expect(transport).to.be.instanceOf(ws.Transport);
            expect( () => transport.close()).to.not.throw;
        });

        it('creates a new transport2', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new ws.Transport(sock);
            expect(transport).to.be.instanceOf(ws.Transport);
            expect( () => transport.close()).to.not.throw;
        });

        it('creates a new transport and connects', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new ws.Transport(sock);
            expect(transport).to.be.instanceOf(ws.Transport);
            expect(transport.isConnected()).to.be.true;
            expect( () => transport.close()).to.not.throw;
        });

        it('closes the transport without throwing', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new ws.Transport(sock);
            expect(transport).to.be.instanceOf(ws.Transport);
            expect( transport.close()).to.not.throw;
            let exists = transport.isConnected();
            expect(exists).to.be.false;
        });

        it('writes to the socket', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new ws.Transport(sock);
            expect(transport).to.be.instanceOf(ws.Transport);
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
            let transport = new ws.Transport(sock);
            expect(transport).to.be.instanceOf(ws.Transport);
            expect(transport.isConnected()).to.be.true;
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
            let transport = new ws.Transport(sock);
            expect(transport).to.be.instanceOf(ws.Transport);
            expect(transport.isConnected()).to.be.true;
            expect(transport.receiveAsync(5)).to.throw;
            expect( () => transport.close()).to.not.throw;
        });

        it('can read from the socket', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new ws.Transport(sock);
            expect(transport).to.be.instanceOf(ws.Transport);
            expect(transport.isConnected()).to.be.true;
            transport.receiveAsync(12).catch();
            transport.onReceive(Buffer.from('{"VERB":"POST", "PATH":"somewhere/something"}', 'utf8'));
            
            expect( () => transport.close()).to.not.throw;
        });

        it('cleans up when onClose is fired', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new ws.Transport(sock);
            expect(transport).to.be.instanceOf(ws.Transport);
            expect(transport.isConnected()).to.be.true;
            transport.onClose();
            expect(transport._active).to.be.undefined;
            expect(transport._activeReceiveResolve).to.be.undefined;
            expect(transport._activeReceiveReject).to.be.undefined;
            expect(transport._socket).to.be.undefined;
            expect(transport._activeOffset).to.equal(0);
            expect(transport._activeReceiveCount).to.equal(0);
        });

        it('cleans up when onError is fired', () => {
            let sock = new FauxSock();
            sock.destroyed = false;
            sock.connecting = false;
            sock.writable = true;
            let transport = new ws.Transport(sock);
            expect(transport).to.be.instanceOf(ws.Transport);
            expect(transport.isConnected()).to.be.true;
            transport.onError();
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
            let transport = new ws.Transport(sock);
            expect(transport).to.be.instanceOf(ws.Transport);
            expect(transport.isConnected()).to.be.true;
            let buff = Buffer.from('hello', 'utf8');
            expect(transport.onReceive(buff)).to.not.throw;
        });


    });

    describe('WebSocket Client Tests', () => {
        it('creates a new client', () => {
            let client = new ws.Client('fakeURL', new protocol.RequestHandler(), false);
            expect(client).to.be.instanceOf(ws.Client);
            expect(client.disconnect()).to.not.throw;
        });

        it('selects the right websocket and attempts to connect to the transport layer', (done) => {
            let client = new ws.Client('fakeURL', new protocol.RequestHandler(), false);
            expect(client).to.be.instanceOf(ws.Client);
            client.connectAsync()
                .catch(
                    (err) => 
                    { expect(err.message).to
                        .equal('Unable to connect client to Node transport.');}) //We don't want to really open a connection.
                .then(done());
        });

        it('sends', (done) => {
            let client = new ws.Client('fakeURL', new protocol.RequestHandler(), false);
            expect(client).to.be.instanceOf(ws.Client);
            let req = new protocol.Request();
            req.Verb = 'POST';
            req.Path = 'some/path';
            req.setBody('Hello World!');
            client.sendAsync(req, new protocol.CancellationToken).catch(err => {expect(err).to.be.undefined;}).then(done());           
        });

        it('disconnects', (done) => {
            let client = new ws.Client('fakeURL', new protocol.RequestHandler(), false);
            expect(client).to.be.instanceOf(ws.Client);
            expect(client.disconnect()).to.not.throw;
            done();
        });
    });

    describe('WebSocket Server Tests', () => {
        it('creates a new server', () => {
            let server = new ws.Server(new FauxSock, new protocol.RequestHandler());
            expect(server).to.be.instanceOf(ws.Server);
            expect(server.disconnect()).to.not.throw;
        });

        it('connects', (done) => {
            let server = new ws.Server(new FauxSock, new protocol.RequestHandler());
            expect(server).to.be.instanceOf(ws.Server);
            expect(server.startAsync()).to.not.throw;
            done();
        });

        it('sends', (done) => {
            let server = new ws.Server(new FauxSock, new protocol.RequestHandler());
            expect(server).to.be.instanceOf(ws.Server);
            let req = new protocol.Request();
            req.Verb = 'POST';
            req.Path = 'some/path';
            req.setBody('Hello World!');
            server.sendAsync(req, new protocol.CancellationToken).catch(err => {expect(err).to.be.undefined;}).then(done());              
        });

        it('disconnects', (done) => {
            let server = new ws.Server(new FauxSock, new protocol.RequestHandler());
            expect(server).to.be.instanceOf(ws.Server);
            expect(server.disconnect()).to.not.throw;
            done();
        });
    });

    describe('BrowserSocket Tests', () => {
        it('creates a new BrowserSocket', () => {
            let bs = new ws.BrowserSocket('fakeURL',  new FauxSock());
            expect(bs).to.be.instanceOf(ws.BrowserSocket);
            expect(() => bs.closeAsync()).to.not.throw;
        });

        it('knows its connected', () => {
            let ns = new ws.BrowserSocket('fakeURL',  new FauxSock());
            expect(ns.isConnected()).to.be.true;
        });

        it('writes to the socket', () => {
            let ns = new ws.BrowserSocket('fakeURL',  new FauxSock());
            let buff = Buffer.from('hello');
            expect(ns.write(buff)).to.not.throw;
        });

        it('always thinks it connects', () => {
            let ns = new ws.BrowserSocket('fakeurl', new FauxSock());
            expect(ns.connectAsync()).to.not.throw;
        });

        it('can set message handlers on the socket', () => {
            let sock = new FauxSock();
            let ns = new ws.BrowserSocket('fakeurl', sock);
            expect(sock.onmessage).to.be.undefined;
            expect(ns.setOnMessageHandler(() => {})).to.not.throw;
            expect(sock.onmessage).to.not.be.undefined;
        });

        it('can set error handler on the socket', () => {
            let sock = new FauxSock();
            let ns = new ws.BrowserSocket('fakeurl', sock);
            expect(sock.onerror).to.be.undefined;
            expect(ns.setOnErrorHandler(() => {})).to.not.throw;
            expect(sock.onerror).to.not.be.undefined;
        });

        it('can set end handler on the socket', () => {
            let sock = new FauxSock();
            let ns = new ws.BrowserSocket('fakeURL', sock);
            expect(sock.onclose).to.be.undefined;
            expect(ns.setOnCloseHandler(() => {})).to.not.throw;
            expect(sock.onclose).to.not.be.undefined;
        });
    });

    describe('NodeSocket Tests', () => {
        it('creates a new NodeSocket', () => {
            let ns = new ws.NodeSocket({url: undefined, serverSocket: new FauxSock});
            expect(ns).to.be.instanceOf(ws.NodeSocket);
            expect(ns.closeAsync()).to.not.be.undefined;
        });

        it('requires a valid URL', () => {
            try {
                let ns = new ws.NodeSocket({url: 'fakeURL', serverSocket: new FauxSock});
            } catch (error) {
                expect(error.message).to.equal('Invalid URL: fakeURL');
            }
        });

        it('always thinks its connected', () => {
            let ns = new ws.NodeSocket({url: undefined, serverSocket: new FauxSock});
            expect(ns.isConnected()).to.be.true;
        });

        it('writes to the socket', () => {
            let ns = new ws.NodeSocket({url: undefined, serverSocket: new FauxSock});
            let buff = Buffer.from('hello');
            expect(ns.write(buff)).to.not.throw;
        });

        it('always thinks it connects', () => {
            let ns = new ws.NodeSocket({url: undefined, serverSocket: new FauxSock});
            expect(ns.connectAsync()).to.not.throw;
        });

        it('can set message handlers on the socket', () => {
            let sock = new FauxSock();
            let ns = new ws.NodeSocket({url: undefined, serverSocket: sock});
            expect(sock.textHandler).to.be.undefined;
            expect(sock.binaryHandler).to.be.undefined;
            expect(ns.setOnMessageHandler(() => {})).to.not.throw;
            expect(sock.textHandler).to.not.be.undefined;
            expect(sock.binaryHandler).to.not.be.undefined;
        });

        it('can set error handler on the socket', () => {
            let sock = new FauxSock();
            let ns = new ws.NodeSocket({url: undefined, serverSocket: sock});
            expect(sock.errorHandler).to.be.undefined;
            expect(ns.setOnErrorHandler(() => {})).to.not.throw;
            expect(sock.errorHandler).to.not.be.undefined;
        });

        it('can set end handler on the socket', () => {
            let sock = new FauxSock();
            let ns = new ws.NodeSocket({url: undefined, serverSocket: sock});
            expect(sock.endHandler).to.be.undefined;
            expect(ns.setOnCloseHandler(() => {})).to.not.throw;
            expect(sock.endHandler).to.not.be.undefined;
        });
    });
});