// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const sinon = require('sinon');
const { delay } = require('../');

describe('delay', function () {
    let sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox({ useFakeTimers: true });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('works with a promise arg', async function () {
        const promise = Promise.resolve(10);

        let result = delay(promise, 250);
        sandbox.clock.tick(251);

        result = await result;
        assert.strictEqual(result, 10);
    });

    it('works without a promise arg', async function () {
        const promise = delay(250);
        sandbox.clock.tick(251);

        const result = await promise;
        assert.strictEqual(result, undefined);
    });
});
