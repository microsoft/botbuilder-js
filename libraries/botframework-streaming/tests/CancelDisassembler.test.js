const { expect } = require('chai');
const { CancelDisassembler } = require('../lib/disassemblers');
const { PayloadSender } = require('../lib/payloadTransport');
const { PayloadTypes } = require('../lib/payloads');

describe('CancelDisassembler', function () {
    it('constructs correctly.', function () {
        const sender = new PayloadSender();
        const cd = new CancelDisassembler(sender, '42', PayloadTypes.cancelStream);

        expect(cd.id).to.equal('42');
        expect(cd.payloadType).to.equal(PayloadTypes.cancelStream);
        expect(cd.sender).to.equal(sender);
    });

    it('sends payload without throwing.', function () {
        const sender = new PayloadSender();
        const cd = new CancelDisassembler(sender, '42', PayloadTypes.cancelStream);

        expect(cd.id).to.equal('42');
        expect(cd.payloadType).to.equal(PayloadTypes.cancelStream);
        expect(cd.sender).to.equal(sender);

        expect(() => cd.disassemble()).to.not.throw();
    });
});
