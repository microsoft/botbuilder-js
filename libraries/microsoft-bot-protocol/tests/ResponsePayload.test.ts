import { ResponsePayload } from '../lib/Payloads/Models/ResponsePayload';
import { StreamDescription } from '../lib/Payloads/Models/StreamDescription';
import { expect } from "chai";

describe('ResponsePayload', () => {

  it('assigns passed in values when constructed', () => {
    let rp = new ResponsePayload(200);
    expect(rp.statusCode)
      .equal(200);
    expect(rp.streams)
      .equal(undefined);
  });

  it('updates values when they are set', () => {
    let rp = new ResponsePayload(200);
    expect(rp.statusCode)
      .equal(200);
    expect(rp.streams)
      .equal(undefined);

    rp.statusCode = 500;
    rp.streams = [new StreamDescription('streamDescription1')];

    expect(rp.statusCode)
      .equal(500);
    expect(rp.streams)
    .to
    .deep
    .include({id: 'streamDescription1'});
     // .equal([{ id: 'streamDescription1' }]);
  });
});
