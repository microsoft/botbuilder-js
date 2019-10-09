const { default: createAsyncSequencer } = require('../lib/Utilities/createAsyncSequencer');
const { expect } = require('chai');

function createDeferred() {
  let deferred = {};

  deferred.promise = new Promise((resolve, reject) => {
    deferred.reject = reject;
    deferred.resolve = resolve;
  });

  return deferred;
}

async function hasResolved(promise) {
  return Promise.race([
    promise,
    Promise.reject()
  ]).then(() => true, () => false);
}

describe('createAsyncSequencer', () => {
  it('should sequentially return randomly-resolved promises', async () => {
    const sequencer = createAsyncSequencer();
    const deferred1 = createDeferred();
    const deferred2 = createDeferred();
    const deferred3 = createDeferred();

    const result1 = sequencer(deferred1.promise);
    const result2 = sequencer(deferred2.promise);
    const result3 = sequencer(deferred3.promise);

    // Nothing has resolved.
    expect(await hasResolved(result1)).to.equal(false);
    expect(await hasResolved(result2)).to.equal(false);
    expect(await hasResolved(result3)).to.equal(false);

    // Resolve 3.
    deferred3.resolve(3);

    // Nothing has resolved, because 1 and 2 is not resolved yet.
    expect(await hasResolved(result1)).to.equal(false);
    expect(await hasResolved(result2)).to.equal(false);
    expect(await hasResolved(result3)).to.equal(false);

    // Resolve 1.
    deferred1.resolve(1);

    // Only 1 has resolved, because 2 is not resolved yet, blocking 3.
    expect(await result1).to.equal(1);
    expect(await hasResolved(result2)).to.equal(false);
    expect(await hasResolved(result3)).to.equal(false);

    // Resolve 2.
    deferred2.resolve(2);

    // As 2 is resolved, 3 will resolve too.
    expect(await result1).to.equal(1);
    expect(await result2).to.equal(2);
    expect(await result3).to.equal(3);
  });
});
