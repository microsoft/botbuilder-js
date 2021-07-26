const assert = require('assert');
const { getTopScoringIntent} = require('../lib');

describe('getTopScoringIntent', function () {
    it(' should never return undefined', function () {
        let result = getTopScoringIntent({
            text: '',
            intents: {},
            entities: {}
        });

        assert.notStrictEqual(result.intent, undefined);
        assert.strictEqual(result.intent, '');
    });

});