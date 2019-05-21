import { TransportContants } from '../src/Transport/TransportConstants';

describe('TransportConstants Tests', () => {

  it('has the proper value for MaxPayloadLength', () => {
    expect(TransportContants.MaxPayloadLength)
      .toEqual(4096);
  });

  it('has the proper value for MaxHeaderLength', () => {
    expect(TransportContants.MaxHeaderLength)
      .toEqual(48);
  });
  it('has the proper value for MaxLength', () => {
    expect(TransportContants.MaxLength)
      .toEqual(999999);
  });
  it('has the proper value for MinLength', () => {
    expect(TransportContants.MinLength)
      .toEqual(0);
  });

  it('throws when attempting to change value for MaxPayloadLength', () => {
    expect(TransportContants.MaxPayloadLength)
      .toEqual(4096);
  });

});
