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
                assert.throws(() => UserTokenClient.createTokenExchangeState(...testConfig.values), {
                    message: `\`${testConfig.paramName}\` must be defined`,
                });
            });
        });
    });
});
