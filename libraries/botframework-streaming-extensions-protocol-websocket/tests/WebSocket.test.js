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
        this.exists = true;       
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
            this.buff = new Buffer.from(this.contentString[this.position]);
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
    };
    destroyed(){ 
        return this.exists;
    };
    on(){};

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
            let buff = new Buffer('hello', 'utf8');
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
            let buff = new Buffer('hello', 'utf8');            
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

        // it('does something', () => {
        //     let sock = new FauxSock();
        //     sock.destroyed = false;
        //     sock.connecting = false;
        //     sock.writable = true;
        //     let transport = new ws.Transport(sock);
        //     expect(transport).to.be.instanceOf(ws.Transport);
        //     expect(transport.isConnected()).to.be.true;
        //     sock.closeHandler;
        //     expect(transport._socket).to.be.undefined;
        // });


    });

    describe('WebSocket Client Tests', () => {
        it('creates a new client', () => {
            let client = new ws.Client('fakeURL', new protocol.RequestHandler(), false);
            expect(client).to.be.instanceOf(ws.Client);
            expect( () => client.disconnect()).to.not.throw;
        });
    });

    describe('WebSocket Server Tests', () => {
        it('creates a new server', () => {
            let server = new ws.Server(new FauxSock, new protocol.RequestHandler());
            expect(server).to.be.instanceOf(ws.Server);
            expect( () => server.disconnect()).to.not.throw;
        });
    });

    describe('BrowserSocket Tests', () => {
        it('creates a new BrowserSocket', () => {
            let bs = new ws.BrowserSocket('fakeURL');
            expect(bs).to.be.instanceOf(ws.BrowserSocket);
            expect(() => bs.closeAsync()).to.not.throw;
        });
    });

    describe('NodeSocket Tests', () => {
        it('creates a new NodeSocket', () => {
            let ns = new ws.NodeSocket({url: 'http://www.contoso.com', serverSocket: new FauxSock});
            expect(ns).to.be.instanceOf(ws.NodeSocket);
            expect(() => ns.closeAsync()).to.not.throw;
        });

        it('requires a valid URL', () => {
            expect(() => new ws.NodeSocket({url: 'fakeURL', serverSocket: new FauxSock})).to.throw;
            expect(() => ns.closeAsync()).to.not.throw;
        });
    });
});