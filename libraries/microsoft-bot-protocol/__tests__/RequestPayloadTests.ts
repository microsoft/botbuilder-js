import { RequestPayload } from '../lib/Payloads/Models/RequestPayload';
import { StreamDescription } from '../lib/Payloads/Models/StreamDescription';

describe('RequestPayload Tests', () => {

  it('assigns passed in values when constructed', () => {
    let rp = new RequestPayload('verbvalue', 'pathvalue');
    expect(rp.path)
      .toEqual('pathvalue');
    expect(rp.verb)
      .toEqual('verbvalue');
    expect(rp.streams)
      .toEqual(undefined);
  });

  it('updates values when they are set', () => {
    let rp = new RequestPayload('verbvalue1', 'pathvalue1');
    expect(rp.path)
      .toEqual('pathvalue1');
    expect(rp.verb)
      .toEqual('verbvalue1');
    expect(rp.streams)
      .toEqual(undefined);

    rp.path = 'pathvalue2';
    rp.verb = 'verbvalue2';
    rp.streams = [new StreamDescription('streamDescription1')];

    expect(rp.path)
      .toEqual('pathvalue2');
    expect(rp.verb)
      .toEqual('verbvalue2');
    expect(rp.streams)
      .toEqual([{ id: 'streamDescription1' }]);
  })

});
