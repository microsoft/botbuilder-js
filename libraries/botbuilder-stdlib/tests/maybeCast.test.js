// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const { maybeCast } = require('../');

describe('maybeCast', function () {
    it('should be transparent', function () {
        const object = {};
        const cast = maybeCast(object);
        assert(object === cast);
    });

    it('should be transparent with a constructor', function () {
        const err = new Error();
        const cast = maybeCast(err, Error);
        assert(err === cast);
    });
});
