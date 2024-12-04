const { PayloadConstants } = require('../lib/payloads/payloadConstants');
const importSync= require('import-sync');
const { expect } = importSync('chai/lib/chai');

describe('PayloadConstants', function () {
    it('has the proper value for MaxPayloadLength', function () {
        expect(PayloadConstants.MaxPayloadLength).equal(4096);
    });

    it('has the proper value for MaxHeaderLength', function () {
        expect(PayloadConstants.MaxHeaderLength).equal(48);
    });

    it('has the proper value for MaxLength', function () {
        expect(PayloadConstants.MaxLength).equal(999999);
    });

    it('has the proper value for MinLength', function () {
        expect(PayloadConstants.MinLength).equal(0);
    });

    it('throws when attempting to change value for MaxPayloadLength', function () {
        expect(PayloadConstants.MaxPayloadLength).equal(4096);
    });
});
