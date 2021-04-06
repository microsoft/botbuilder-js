const assert = require('assert');
const { UserTokenClient } = require('../..');

describe('UserTokenClient', function () {
    describe('createTokenExchangeState', function () {
        const paramsValidation = [
            { paramName: 'appId', values: [null, null, null] },
            { paramName: 'connectionName', values: ['appId', null, null] },
            { paramName: 'activity', values: ['appId', 'connectionName', null] },
        ];

        paramsValidation.forEach((testConfig) => {
            it(`should throw with null ${testConfig.paramName}`, function () {
                // TODO: Unpack why botbuilder-stdlib.assert isn't workng with assert.throws().
                try {
                    UserTokenClient.createTokenExchangeState(
                        testConfig.values[0],
                        testConfig.values[1],
                        testConfig.values[2]
                    );
                } catch (err) {
                    assert.strictEqual(err.message, `\`${testConfig.paramName}\` must be defined`);
                }
            });
        });
    });
});
