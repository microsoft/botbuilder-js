const protocol = require("../lib/");
const  chai  = require('chai');
var expect = chai.expect;

class MockSocket{
    send(buffer){
        let buff = buffer;
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

        ps.writePacket(packet);
    });
});

