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
    setOnMessageHandler(){};
    setOnErrorHandler(){};
    setOnCloseHandler(){};
    setReceiver(receiver){
        this.receiver = receiver;
    }
}

describe('WebSocket Transport Tests', () => {
    it('creates a new transport', () => {
        let transport = new ws.Transport(new FauxSock);
        expect(transport).to.be.instanceOf(ws.Transport);
    });
});

describe('WebSocket Client Tests', () => {
    it('creates a new client', () => {
        let client = new ws.Client('fakeURL', new protocol.RequestHandler(), false);
        expect(client).to.be.instanceOf(ws.Client);
    });
});

describe('WebSocket Server Tests', () => {
    it('creates a new server', () => {
        let server = new ws.Server(new FauxSock, new protocol.RequestHandler());
        expect(server).to.be.instanceOf(ws.Server);
    });
});

describe('BrowserSocket Tests', () => {
    it('creates a new BrowserSocket', () => {
        let bs = new ws.BrowserSocket('fakeURL');
        expect(bs).to.be.instanceOf(ws.BrowserSocket);
    });
});

describe('NodeSocket Tests', () => {
    it('creates a new NodeSocket', () => {
        let ns = new ws.NodeSocket({url: 'http://www.fakeURL.com', serverSocket: new FauxSock});
        expect(ns).to.be.instanceOf(ws.NodeSocket);
    });
    
    it('requires a valid URL', () => {
        expect(() => new ws.NodeSocket({url: 'fakeURL', serverSocket: new FauxSock})).to.throw;
    });
});