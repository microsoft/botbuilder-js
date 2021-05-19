// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const sinon = require('sinon');
const { retry } = require('../');

describe('retry', function () {
    it('succeeds on first try', async function () {
        const fake = sinon.fake((n) => Promise.resolve(n));
        assert.strictEqual(await retry(fake, 3, 0), 1);
        assert.strictEqual(fake.callCount, 1);
    });

    it('handles zero retries', async function () {
        const fake = sinon.fake((n) => Promise.resolve(n));
        assert.strictEqual(await retry(fake, 0, 0), 1);
        assert.strictEqual(fake.callCount, 1);
    });

    it('handles negative retries', async function () {
        const fake = sinon.fake((n) => Promise.resolve(n));
        assert.strictEqual(await retry(fake, -10, 0), 1);
        assert.strictEqual(fake.callCount, 1);
    });

    it('succeeds eventually', async function () {
        const fake = sinon.fake((n) => (n < 3 ? Promise.reject() : Promise.resolve(10)));
        assert.strictEqual(await retry(fake, 3, 0), 10);
        assert.strictEqual(fake.callCount, 3);
    });

    it('yields error if never succeeds', async function () {
        const fake = sinon.fake(() => Promise.reject(new Error('oh no')));
        await assert.rejects(retry(fake, 3, 0), {
            name: 'Error',
            message: 'oh no',
        });
        assert.strictEqual(fake.callCount, 3);
    });
});
