import { Stream } from '../src/Stream';
import { expect } from "chai";

describe('Stream', () => {
  it('throws on invalid encoding types', () => {
  //  expect.assertions(1);
    let s = new Stream();

    expect(() => s.write('data', 'supercoolencoding'))
      .to
      .throw('"encoding" must be a valid string encoding');

  });

  it('does not throw on valid on valid encoding types', () => {
  //  expect.assertions(1);
    let s = new Stream();

    expect(() => s.write('data', 'utf8'))
      .not
      .to
      .throw();

  });
});
