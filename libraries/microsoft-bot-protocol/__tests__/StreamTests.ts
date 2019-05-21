import { Stream } from '../src/Stream';

describe('Stream tests', () => {
  it('throws on invalid encoding types', () => {
    expect.assertions(1);
    let s = new Stream();

    expect(() => s.write('data', 'supercoolencoding'))
      .toThrowError('"encoding" must be a valid string encoding');

  });

  it('does not throw on valid on valid encoding types', () => {
    expect.assertions(1);
    let s = new Stream();

    expect(() => s.write('data', 'utf8'))
      .not
      .toThrow();

  });
});
