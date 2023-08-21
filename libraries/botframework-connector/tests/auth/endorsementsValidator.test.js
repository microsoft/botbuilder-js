// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const { EndorsementsValidator } = require('../..');

describe('EndorsementsValidator', function () {
    it('with null channelId should pass', function () {
        assert(EndorsementsValidator.validate(null, new Set([])));
    });

    it('with null endorsements should throw', function () {
        assert.throws(() => EndorsementsValidator.validate('foo', null));
    });

    it('with unendorsed channelId should fail', function () {
        assert(!EndorsementsValidator.validate('channelOne', new Set([])));
    });

    it('with mismatched endorsements should fail', function () {
        assert(!EndorsementsValidator.validate('right', new Set(['wrong'])));
    });

    it('with endorsed channelId should pass', function () {
        assert(EndorsementsValidator.validate('right', new Set(['right'])));
    });

    it('with endorsed channelId and many endorsements should pass', function () {
        assert(EndorsementsValidator.validate('right', new Set(['wrong', 'right'])));
    });

    it('with empty channelId should pass', function () {
        assert(EndorsementsValidator.validate('', new Set(['wrong', 'right'])));
    });
});
