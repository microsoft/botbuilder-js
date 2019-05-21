import { MockStreamManager } from '../__mocks__/MockStreamManager';
import { ContentStream } from '../src/ContentStream';
import { ContentStreamAssembler } from '../src/Payloads/Assemblers/ContentStreamAssembler';
import { StreamManager } from '../src/Payloads/StreamManager';
import { Stream } from '../src/Stream';

describe('ContentStream Tests', () => {
  it('assigns ID when constructed', () => {
    let cs = new ContentStream('1', new ContentStreamAssembler(new MockStreamManager(), 'csa1', 'stream', 42));

    expect(cs.id)
      .toEqual('1');
  });

  it('throws if no assembler is passed in on construction', () => {
    expect.assertions(1);
    expect(() => new ContentStream('1', undefined))
      .toThrowError('Null Argument Exception');
  });

  it('can return payload type', () => {
    let cs = new ContentStream('1', new ContentStreamAssembler(new MockStreamManager(), 'csa1', 'stream', 42));

    expect(cs.payloadType)
      .toEqual('stream');
  });

  it('can return length', () => {
    let cs = new ContentStream('1', new ContentStreamAssembler(new MockStreamManager(), 'csa1', 'stream', 42));

    expect(cs.length)
      .toEqual(42);
  });

  it('can return ID', () => {
    let cs = new ContentStream('1', new ContentStreamAssembler(new MockStreamManager(), 'csa1', 'stream', 42));

    expect(cs.id)
      .toEqual('1');
  });

  it('returns the payload stream when stream is undefined', () => {
    let cs = new ContentStream('1', new ContentStreamAssembler(new MockStreamManager(), 'csa1', 'stream', 42));

    expect(cs.getStream())
      .toBeInstanceOf(Stream);
  });

  it('reads a stream of length 0 and returns an empty string', () => {
    let cs = new ContentStream('1', new ContentStreamAssembler(new MockStreamManager(), 'csa1', 'stream', 0));

    return cs.readAsString()
      .then(data => {
        expect(data)
          .toBe('');
      });
  }, 5000);

  it('throws when reading an empty stream as JSON', () => {
    expect.assertions(1);
    let cs = new ContentStream('1', new ContentStreamAssembler(new MockStreamManager(), 'csa1', 'stream', 0));

    return cs.readAsJson()
      .then(data => {
        expect(data)
          .toBeDefined();
      })
      .catch(err => {
        expect(err.toString())
          .toBe('SyntaxError: Unexpected end of JSON input');
      });
  }, 5000);
});
