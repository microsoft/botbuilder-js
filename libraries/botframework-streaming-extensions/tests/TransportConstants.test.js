const TransportConstants = require( '../lib/Transport/TransportConstants');
const chai = require( 'chai');
var expect = chai.expect;
describe('TransportConstants', () => {

    it('has the proper value for MaxPayloadLength', () => {
        expect(TransportConstants.TransportContants.MaxPayloadLength)
            .equal(4096);
    });

    it('has the proper value for MaxHeaderLength', () => {
        expect(TransportConstants.TransportContants.MaxHeaderLength)
            .equal(48);
    });
    it('has the proper value for MaxLength', () => {
        expect(TransportConstants.TransportContants.MaxLength)
            .equal(999999);
    });
    it('has the proper value for MinLength', () => {
        expect(TransportConstants.TransportContants.MinLength)
            .equal(0);
    });

    it('throws when attempting to change value for MaxPayloadLength', () => {
        expect(TransportConstants.TransportContants.MaxPayloadLength)
            .equal(4096);
    });

});
