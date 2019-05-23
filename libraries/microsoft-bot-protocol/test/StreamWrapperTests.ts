import { StreamWrapper } from '../src/Payloads/Disassemblers/StreamWrapper';
import { Stream } from '../src/Stream';
import { expect } from "chai";

describe('StreamWrapper', () => {

  it('assigns correct values when constructed', () => {
   // expect.assertions(2);
    let s = new Stream();
    s._write('some text', 'utf8', (data) => { });
    let sw = new StreamWrapper(s, 9);

    expect(sw.stream)
      .to.equal(s);

    expect(sw.streamLength)
      .to.equal(9);
  });
});
