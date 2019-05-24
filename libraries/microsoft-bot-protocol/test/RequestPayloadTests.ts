import { RequestPayload } from '../lib/Payloads/Models/RequestPayload';
import { StreamDescription } from '../lib/Payloads/Models/StreamDescription';
import { expect } from "chai";

describe('RequestPayload', () => {

  it('assigns passed in values when constructed', () => {
    let rp = new RequestPayload('verbvalue', 'pathvalue');
    expect(rp.path)
      .equal('pathvalue');
    expect(rp.verb)
      .equal('verbvalue');
    expect(rp.streams)
      .equal(undefined);
  });

  it('updates values when they are set', () => {
    let rp = new RequestPayload('verbvalue1', 'pathvalue1');
    expect(rp.path)
      .equal('pathvalue1');
    expect(rp.verb)
      .equal('verbvalue1');
    expect(rp.streams)
      .equal(undefined);

    rp.path = 'pathvalue2';
    rp.verb = 'verbvalue2';
    rp.streams = [new StreamDescription('streamDescription1')];

    expect(rp.path)
      .equal('pathvalue2');
    expect(rp.verb)
      .equal('verbvalue2');
      expect(rp.streams)
      .to
      .deep
      .include({id: 'streamDescription1'});
  })

});
