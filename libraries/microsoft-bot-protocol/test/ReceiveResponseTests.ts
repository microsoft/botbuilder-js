import { MockStreamManager } from '../__mocks__/MockStreamManager';
import { ContentStream } from '../src/ContentStream';
import { ContentStreamAssembler } from '../src/Payloads/Assemblers/ContentStreamAssembler';
import { ReceiveResponse } from '../src/ReceiveResponse';
import { expect } from "chai";

describe('ReceiveResponse', () => {

  it('assigns an empty array to streams when constructed', () => {
    let rr = new ReceiveResponse();
    expect(rr.Streams)
      .to
      .be
      .an('array')
      .that
      .is
      .empty;
  });

  it('can update the value of statuscode', () => {
    let rr = new ReceiveResponse();
    rr.StatusCode = 200;

    expect(rr.StatusCode)
      .equal(200);
  });

  it('can update the value of streams', () => {
    let rr = new ReceiveResponse();
    let stream1 = new ContentStream('1', new ContentStreamAssembler(new MockStreamManager(), '1', undefined, undefined));
    let stream2 = new ContentStream('2', new ContentStreamAssembler(new MockStreamManager(), '2', undefined, undefined));
    rr.Streams = [stream1, stream2];
    
    expect(rr.Streams)
    .to
    .be
    .an('array');

    expect(rr.Streams)
    .to
    .have
    .lengthOf(2);

    expect(rr.Streams[0])
      .to
      .deep
      .equal(stream1);

    expect(rr.Streams[1])
    .to
    .deep
    .equal(stream2);
  });
});
