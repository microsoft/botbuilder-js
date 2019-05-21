import { ResponsePayload } from '../lib/Payloads/Models/ResponsePayload';
import { StreamDescription } from '../lib/Payloads/Models/StreamDescription';

describe('ResponsePayload Tests', () => {

  it('assigns passed in values when constructed', () => {
    let rp = new ResponsePayload(200);
    expect(rp.statusCode)
      .toEqual(200);
    expect(rp.streams)
      .toEqual(undefined);
  });

  it('updates values when they are set', () => {
    let rp = new ResponsePayload(200);
    expect(rp.statusCode)
      .toEqual(200);
    expect(rp.streams)
      .toEqual(undefined);

    rp.statusCode = 500;
    rp.streams = [new StreamDescription('streamDescription1')];

    expect(rp.statusCode)
      .toEqual(500);
    expect(rp.streams)
      .toEqual([{ id: 'streamDescription1' }]);
  });
});
