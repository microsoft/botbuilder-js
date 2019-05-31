const protocol = require("../lib/");
const  chai  = require('chai');
var expect = chai.expect;

class MockSocket{
    send(buffer){
        let buff = buffer;
        return buff.length;
    };
    
    close(){};
}

describe('PayloadSender', () => {

    it('starts out disconnected.', () => {
        let ps = new protocol.PayloadSender();
        expect(ps.isConnected).to.equal(false);
    });

    it('connects to its sender.', () => {
        let ps = new protocol.PayloadSender();
        ps.connect(new MockSocket);
        expect(ps.isConnected).to.equal(true);
    });

    it('writes to its sender.', () => {
        let ps = new protocol.PayloadSender();
        ps.connect(new MockSocket);
        expect(ps.isConnected).to.equal(true);

        let stream = new protocol.Stream();
        stream.write('This is a test stream.');
        let header = new protocol.Header(protocol.PayloadTypes.request, '42', '100', true);
        let packet = new protocol.SendPacket(header, stream, undefined);

        expect(ps.writePacket(packet)).to.not.throw;
    });

    it('calls the packet sent callback.', (done) => {
        let ps = new protocol.PayloadSender();
        ps.connect(new MockSocket);
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
        ps.connect(new MockSocket);
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
        ps.connect(new MockSocket);
        expect(ps.isConnected).to.equal(true);
        expect(ps.disconnected).to.not.be.undefined;

        let stream = new protocol.Stream();
        stream.write('This is a test stream.');
        let header = new protocol.Header(protocol.PayloadTypes.request, '42', '100', true);
        let packet = new protocol.SendPacket(header, stream, undefined);

        expect(ps.writePacket(packet)).to.not.throw;
    });

});

