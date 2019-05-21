import { ContentStreamAssembler } from "../src/Payloads/Assemblers/ContentStreamAssembler";
import { MockStreamManager } from "../__mocks__/MockStreamManager";
import { Stream } from "stream";

describe('ContentStreamAssembler Tests', () => {
  it('assigns values when constructed', () => {
    let csa = new ContentStreamAssembler(new MockStreamManager(), '1', 'stream', 50);
    expect(csa.id)
      .toEqual('1');
    expect(csa.contentLength)
      .toEqual(50);
    expect(csa.contentType)
      .toEqual('stream');
    expect(csa.end)
      .toEqual(undefined);
  });

  it('returns a Stream', () => {
    let csa = new ContentStreamAssembler(new MockStreamManager(), '1', 'stream', 50);
    expect(csa.createPayloadStream())
      .toBeInstanceOf(Stream);
  });
});
