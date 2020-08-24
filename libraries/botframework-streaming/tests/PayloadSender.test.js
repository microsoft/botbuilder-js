const SubscribableStream = require('../lib/subscribableStream');
const StreamManager = require('../lib/payloads/streamManager');
const PayloadSender = require('../lib/payloadTransport/payloadSender');
const PayloadReceiver = require('../lib/payloadTransport/payloadReceiver');
const PayloadTypes = require('../lib/payloads/payloadTypes');
const PayloadAssemblerManager = require('../lib/payloads/payloadAssemblerManager');
const  chai  = require('chai');
var sinon = require('sinon');
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
    }

    receive(readLength){
        if(this.contentString[this.position])
        {
            this.buff = Buffer.from(this.contentString[this.position]);
            this.position++;

            return this.buff.slice(0, readLength);
        }

        if(this.receiver.isConnected)
            this.receiver.disconnect();
    }
    close(){}

    setReceiver(receiver){
        this.receiver = receiver;
    }
}
describe('PayloadTransport', () => {
    describe('PayloadSender', () => {
        it('starts out disconnected.', () => {
            let ps = new PayloadSender.PayloadSender();
            expect(ps.isConnected).to.equal(false);
        });

        it('connects to its sender.', () => {
            let ps = new PayloadSender.PayloadSender();
            ps.connect(new FauxSock);
            expect(ps.isConnected).to.equal(true);
        });

        it('writes to its sender.', (done) => {
            let ps = new PayloadSender.PayloadSender();
            ps.connect(new FauxSock);
            expect(ps.isConnected).to.equal(true);

            let stream = new SubscribableStream.SubscribableStream();
            stream.write('This is a test stream.');
            let header = {
                payloadType: PayloadTypes.PayloadTypes.request,
                payloadLength: stream.length,
                id: '100',
                end: true
            };

            const psSenderSpy = sinon.spy(ps.sender, 'send');
            expect(ps.sendPayload(header, stream, ()=>done()));
            expect(psSenderSpy.calledTwice).to.be.true;
        });

        it('writes a large stream to its sender.', (done) => {
            const ps = new PayloadSender.PayloadSender();
            ps.connect(new FauxSock);
            expect(ps.isConnected).to.equal(true);
    
            const stream = new SubscribableStream.SubscribableStream();
            let testString;
            let count = 250;
            while (count >= 0) {
                testString += 'This is a LARGE test stream.';
                count--;
            }
    
            stream.write(testString);
            // Max PayloadLength is 4096
            const header = {
                payloadType: PayloadTypes.PayloadTypes.request,
                payloadLength: stream.length,
                id: '100',
                end: true
            };
            const psSenderSpy = sinon.spy(ps.sender, 'send');
            
            expect(ps.sendPayload(header, stream, () => {
                // This try-catch is required as chai failures need to be caught and bubbled up via done(). 
                try {
                    expect(psSenderSpy.callCount).to.equal(4);
                    done();
                } catch (e) { 
                    done(e);
                }
            }));
        });

        it('calls the packet sent callback.', (done) => {
            let ps = new PayloadSender.PayloadSender();
            ps.connect(new FauxSock);
            expect(ps.isConnected).to.equal(true);

            let stream = new SubscribableStream.SubscribableStream();
            stream.write('This is a test stream.');
            let header = {payloadType: PayloadTypes.PayloadTypes.request, payloadLength: 22, id: '100', end: true};

            ps.sendPayload(header, stream, ()=>done());
        });

        it('disconnects when header length is longer than packet length.', () => {
            let ps = new PayloadSender.PayloadSender();
            ps.connect(new FauxSock);
            expect(ps.isConnected).to.equal(true);

            let stream = new SubscribableStream.SubscribableStream();
            stream.write('This is a test stream.');
            let header = {payloadType: PayloadTypes.PayloadTypes.request, payloadLength: 42, id: '100', end: true};
            let packet = {header: header, payload: stream, sendCallBack: undefined};

            ps.sendPayload(header, stream, ()=>done());

            expect(ps.isConnected).to.equal(false);
        });

        it('gracefully fails when trying to write before connecting.', (done) => {
            let ps = new PayloadSender.PayloadSender();
            ps.disconnected = () => done();
            expect(ps.isConnected).to.equal(false);
            ps.connect(new FauxSock);
            expect(ps.isConnected).to.equal(true);
            expect(ps.disconnected).to.not.be.undefined;

            let stream = new SubscribableStream.SubscribableStream();
            stream.write('This is a test stream.');
            let header = {payloadType: PayloadTypes.PayloadTypes.request, payloadLength: 22, id: '100', end: true};
            let packet = {header: header, payload: stream, sendCallBack: ()=>done()};

            ps.sendPayload(header, stream, ()=>done());
        });

    });

    describe('PayloadReceiver', () => {

        it('begins disconnected.', () => {
            let pr = new PayloadReceiver.PayloadReceiver();
            expect(pr.isConnected).to.be.undefined;
        });

        it('connects to and reads a header with no payload from the transport.', () => {
            let pr = new PayloadReceiver.PayloadReceiver();
            expect(pr.isConnected).to.be.undefined;

            let sock = new FauxSock(['A.000000.68e999ca-a651-40f4-ad8f-3aaf781862b4.1\n']);
            sock.setReceiver(pr);

            pr.connect(sock);
            expect(pr.isConnected).to.be.true;
        });

        it('connects to and reads a header with a stream the transport.', (done) => {
            let pr = new PayloadReceiver.PayloadReceiver();
            expect(pr.isConnected).to.be.undefined;

            let sock = new FauxSock(['S.000005.68e999ca-a651-40f4-ad8f-3aaf781862b4.1\n', '12345']);
            sock.setReceiver(pr);

            this.streamManager = new StreamManager.StreamManager(undefined);
            assemblerManager = new PayloadAssemblerManager.PayloadAssemblerManager(
                this.streamManager,
                (id, response) => onReceiveResponse(id, response),
                (id, request) => onReceiveRequest(id, request)
            );

            pr.subscribe((header) =>  assemblerManager.getPayloadStream(header),
                (header, contentStream, contentLength) => assemblerManager.onReceive(header, contentStream, contentLength));

            expect(pr.connect(sock)).to.not.throw;

            pr.disconnected = () => done();
            expect(pr.isConnected).to.be.true;
        });
    });
});
