const { strictEqual } = require('assert');
const { SpeechConstants } = require('../');

describe('SpeechConstants', () => {
    // For ensuring that the defined SpeechConstants match the values defined in the botframework activity spec as of:
    // https://github.com/microsoft/botframework-obi/pull/85

    it('SpeechConstants.EmptySpeakTag should match value in botframework activity spec', () => {
        // Expected value derived from https://github.com/microsoft/botframework-obi/blame/5c2542115b110a1dae8e597473271abc8e67c30d/protocols/botframework-activity/botframework-activity.md#L353
        strictEqual(SpeechConstants.EmptySpeakTag, `<speak version="1.0" xmlns="https://www.w3.org/2001/10/synthesis" xml:lang="en-US" />`)
    });
});
