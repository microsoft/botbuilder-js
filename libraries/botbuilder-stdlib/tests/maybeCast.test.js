// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const { maybeCast } = require('../');

describe('maybeCast', () => {
    it('should be transparent', () => {
        const object = {};
        const cast = maybeCast(object);
        assert(object === cast);
    });

    it('should be transparent with a constructor', () => {
        const err = new Error();
        const cast = maybeCast(err, Error);
        assert(err === cast);
    });
});
