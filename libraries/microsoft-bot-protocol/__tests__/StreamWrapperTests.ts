
import { StreamWrapper } from '../src/Payloads/Disassemblers/StreamWrapper';
import { Stream } from '../src/Stream';
describe('StreamWrapper tests', () => {

  it('assigns correct values when constructed', () => {
    expect.assertions(2);
    let s = new Stream();
    s._write('some text', 'utf8', (data) => { });
    let sw = new StreamWrapper(s, 9);

    expect(sw.stream)
      .toBe(s);

    expect(sw.streamLength)
      .toBe(9);
  });
});
