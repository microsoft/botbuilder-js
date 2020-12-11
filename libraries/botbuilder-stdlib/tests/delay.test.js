// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const sinon = require('sinon');
const { delay } = require('../');

describe('delay', () => {
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox({ useFakeTimers: true });
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('works with a promise arg', async () => {
        const promise = Promise.resolve(10);

        let result = delay(250, promise);
        sandbox.clock.tick(251);

        result = await result;
        assert.strictEqual(result, 10);
    });

    it('works without a promise arg', async () => {
        const promise = delay(250);
        sandbox.clock.tick(251);

        const result = await promise;
        assert.strictEqual(result, undefined);
    });
});
