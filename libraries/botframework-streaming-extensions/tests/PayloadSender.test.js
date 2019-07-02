const protocol = require("../lib/");
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
            this.buff = Buffer.from(this.contentString[this.position]);
            this.position++;

            return this.buff.slice(0, readLength);
        }

        if(this.receiver.isConnected)
            this.receiver.disconnect();
    }    
    close(){};

    setReceiver(receiver){
        this.receiver = receiver;
    }
}
describe('PayloadTransport', () => {
    describe('PayloadSender', () => {

        it('starts out disconnected.', () => {
            let ps = new protocol.PayloadSender();
            expect(ps.isConnected).to.equal(false);
        });

        it('connects to its sender.', () => {
            let ps = new protocol.PayloadSender();
            ps.connect(new FauxSock);
            expect(ps.isConnected).to.equal(true);
        });

        it('writes to its sender.', () => {
            let ps = new protocol.PayloadSender();
            ps.connect(new FauxSock);
            expect(ps.isConnected).to.equal(true);

            let stream = new protocol.Stream();
            stream.write('This is a test stream.');
            let header = new protocol.Header(protocol.PayloadTypes.request, '42', '100', true);
            let packet = new protocol.SendPacket(header, stream, undefined);

            expect(ps.writePacket(packet)).to.not.throw;
        });

        it('calls the packet sent callback.', (done) => {
            let ps = new protocol.PayloadSender();
            ps.connect(new FauxSock);
            expect(ps.isConnected).to.equal(true);

            let stream = new protocol.Stream();
            stream.write('This is a test stream.');
            let header = new protocol.Header(protocol.PayloadTypes.request, '22', '100', true);
            let packet = new protocol.SendPacket(header, stream, () => done());

            ps.writePacket(packet);

            expect(done);
        });

        it('disconnects when header length is longer than packet length.', () => {
            let ps = new protocol.PayloadSender();
            ps.connect(new FauxSock);
            expect(ps.isConnected).to.equal(true);

            let stream = new protocol.Stream();
            stream.write('This is a test stream.');
            let header = new protocol.Header(protocol.PayloadTypes.request, '42', '100', true);
            let packet = new protocol.SendPacket(header, stream, undefined);

            ps.writePacket(packet);

            expect(ps.isConnected).to.equal(false);
        });

        it('gracefully fails when trying to write before connecting.', (done) => {
            let ps = new protocol.PayloadSender();
            ps.disconnected = () => done();
            expect(ps.isConnected).to.equal(false);
            ps.connect(new FauxSock);
            expect(ps.isConnected).to.equal(true);
            expect(ps.disconnected).to.not.be.undefined;

            let stream = new protocol.Stream();
            stream.write('This is a test stream.');
            let header = new protocol.Header(protocol.PayloadTypes.request, '42', '100', true);
            let packet = new protocol.SendPacket(header, stream, undefined);

            expect(ps.writePacket(packet)).to.not.throw;
        });

    });

    describe('PayloadReceiver', () => {
        
        it('begins disconnected.', () => {
            let pr = new protocol.PayloadReceiver();
            expect(pr.isConnected).to.be.undefined;
        });

        it('connects to and reads a header with no payload from the transport.', () => {
            let pr = new protocol.PayloadReceiver();
            expect(pr.isConnected).to.be.undefined;

            let sock = new FauxSock(["A.000000.68e999ca-a651-40f4-ad8f-3aaf781862b4.1\n"]);
            sock.setReceiver(pr);

            pr.connect(sock);
            expect(pr.isConnected).to.be.true;
        });

        it('connects to and reads a header with a stream the transport.', (done) => {
            let pr = new protocol.PayloadReceiver();
            expect(pr.isConnected).to.be.undefined;

            let sock = new FauxSock(["S.000005.68e999ca-a651-40f4-ad8f-3aaf781862b4.1\n", "12345"]);
            sock.setReceiver(pr);

            this.streamManager = new protocol.StreamManager(undefined);
            assemblerManager = new protocol.PayloadAssembleManager(
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