// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const { EndorsementsValidator } = require('../..');

describe('EndorsementsValidator', () => {
    it('with null channelId should pass', () => {
        assert(EndorsementsValidator.validate(null, []));
    });

    it('with null endorsements should throw', () => {
        assert.throws(() => EndorsementsValidator.validate('foo', null));
    });

    it('with unendorsed channelId should fail', () => {
        assert(!EndorsementsValidator.validate('channelOne', []));
    });

    it('with mismatched endorsements should fail', () => {
        assert(!EndorsementsValidator.validate('right', ['wrong']));
    });

    it('with endorsed channelId should pass', () => {
        assert(EndorsementsValidator.validate('right', ['right']));
    });

    it('with endorsed channelId and many endorsements should pass', () => {
        assert(EndorsementsValidator.validate('right', ['wrong', 'right']));
    });

    it('with empty channelId should pass', () => {
        assert(EndorsementsValidator.validate('', ['wrong', 'right']));
    });
});
