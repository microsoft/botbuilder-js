import { MockStreamManager } from '../__mocks__/MockStreamManager';
import { ContentStream } from '../src/ContentStream';
import { ContentStreamAssembler } from '../src/Payloads/Assemblers/ContentStreamAssembler';
import { ReceiveResponse } from '../src/ReceiveResponse';

describe('ReceiveResponse Tests', () => {

  it('assigns an empty array to streams when constructed', () => {
    let rr = new ReceiveResponse();
    expect(rr.Streams)
      .toEqual([]);
  });

  it('can update the value of statuscode', () => {
    let rr = new ReceiveResponse();
    rr.StatusCode = 200;

    expect(rr.StatusCode)
      .toEqual(200);
  });

  it('can update the value of streams', () => {
    let rr = new ReceiveResponse();
    let stream1 = new ContentStream('1', new ContentStreamAssembler(new MockStreamManager(), '1', undefined, undefined));
    let stream2 = new ContentStream('2', new ContentStreamAssembler(new MockStreamManager(), '2', undefined, undefined));
    rr.Streams = [stream1, stream2];

    expect(rr.Streams)
      .toEqual([{ assembler: { _streamManager: {}, contentLength: undefined, contentType: undefined, id: '1' }, id: '1' }, { assembler: { _streamManager: {}, contentLength: undefined, contentType: undefined, id: '2' }, id: '2' }]);
  });
});
