import { TransportContants } from '../src/Transport/TransportConstants';
import { expect } from "chai";

describe('TransportConstants', () => {

  it('has the proper value for MaxPayloadLength', () => {
    expect(TransportContants.MaxPayloadLength)
      .equal(4096);
  });

  it('has the proper value for MaxHeaderLength', () => {
    expect(TransportContants.MaxHeaderLength)
      .equal(48);
  });
  it('has the proper value for MaxLength', () => {
    expect(TransportContants.MaxLength)
      .equal(999999);
  });
  it('has the proper value for MinLength', () => {
    expect(TransportContants.MinLength)
      .equal(0);
  });

  it('throws when attempting to change value for MaxPayloadLength', () => {
    expect(TransportContants.MaxPayloadLength)
      .equal(4096);
  });

});
