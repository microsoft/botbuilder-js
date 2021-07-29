// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const { stringExt } = require('..');

describe('stringext', function () {
    describe('isNilOrEmpty', function () {
        it("works for ''", function () {
            assert(stringExt.isNilOrEmpty(''));
        });

        it('works for undefined', function () {
            assert(stringExt.isNilOrEmpty(undefined));
        });

        it('works for null', function () {
            assert(stringExt.isNilOrEmpty(null));
        });

        it('works for numbers', function () {
            assert(!stringExt.isNilOrEmpty(2));
        });
    });
});
