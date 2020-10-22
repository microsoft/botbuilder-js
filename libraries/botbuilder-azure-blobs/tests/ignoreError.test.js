// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const { ignoreError } = require('../lib/ignoreError');

describe('ignoreError', () => {
    it('should ignore errors properly', async () => {
        await assert.doesNotReject(() => ignoreError(Promise.reject(10), (err) => err === 10));
    });

    it('should not ignore every error', async () => {
        await assert.rejects(() => ignoreError(Promise.reject(11), (err) => err === 10));
    });
});
