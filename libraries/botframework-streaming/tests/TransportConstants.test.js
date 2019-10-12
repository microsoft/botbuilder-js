const Constants = require( '../lib/Payloads/PayloadConstants');
const chai = require( 'chai');
var expect = chai.expect;
describe('TransportConstants', () => {

    it('has the proper value for MaxPayloadLength', () => {
        expect(Constants.PayloadConstants.MaxPayloadLength)
            .equal(4096);
    });

    it('has the proper value for MaxHeaderLength', () => {
        expect(Constants.PayloadConstants.MaxHeaderLength)
            .equal(48);
    });
    it('has the proper value for MaxLength', () => {
        expect(Constants.PayloadConstants.MaxLength)
            .equal(999999);
    });
    it('has the proper value for MinLength', () => {
        expect(Constants.PayloadConstants.MinLength)
            .equal(0);
    });

    it('throws when attempting to change value for MaxPayloadLength', () => {
        expect(Constants.PayloadConstants.MaxPayloadLength)
            .equal(4096);
    });

});
