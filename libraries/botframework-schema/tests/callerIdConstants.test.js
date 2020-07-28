const { strictEqual } = require('assert');
const { CallerIdConstants } = require('../');

describe('CallerIdConstants', () => {
    // For ensuring that the defined CallerIdConstants match the values defined in the botframework activity spec as of:
    // https://github.com/microsoft/botframework-obi/pull/50 (https://github.com/microsoft/botframework-sdk/pull/5942)

    it('CallerIdConstants.PublicAzureChannel should match value in botframework activity spec', () => {
        // Expected value derived from:
        // https://github.com/microsoft/botframework-sdk/blob/13be0336527fcc0e52d505ae38bd36a73742e74b/specs/botframework-activity/botframework-activity.md#bot-framework
        strictEqual(CallerIdConstants.PublicAzureChannel, 'urn:botframework:azure');
    });

    it('CallerIdConstants.USGovChannel should match value in botframework activity spec', () => {
        // Expected value derived from:
        // https://github.com/microsoft/botframework-sdk/blob/13be0336527fcc0e52d505ae38bd36a73742e74b/specs/botframework-activity/botframework-activity.md#bot-framework
        strictEqual(CallerIdConstants.USGovChannel, 'urn:botframework:azureusgov');
    });

    it('CallerIdConstants.BotToBotPrefix should match value in botframework activity spec', () => {
        // Expected value derived from:
        // https://github.com/microsoft/botframework-sdk/blob/13be0336527fcc0e52d505ae38bd36a73742e74b/specs/botframework-activity/botframework-activity.md#bot-framework
        strictEqual(CallerIdConstants.BotToBotPrefix, 'urn:botframework:aadappid:');
    });
});
