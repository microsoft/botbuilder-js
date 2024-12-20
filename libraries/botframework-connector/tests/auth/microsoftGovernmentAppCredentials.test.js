const { MicrosoftGovernmentAppCredentials, GovernmentConstants } = require('../..');
const assert = require('assert');

describe('MicrosoftGovernmentAppCredentialsTestSuite', function () {
    describe('MicrosoftGovernmentAppCredentialsTestCase', function () {
        it('AssertOAuthEndpointAndOAuthScope', function () {
            const credentials1 = new MicrosoftGovernmentAppCredentials('appId', 'password', 'tenantId', 'audience');
            assert.strictEqual(
                GovernmentConstants.ToChannelFromBotLoginUrlPrefix + 'tenantId',
                credentials1.oAuthEndpoint,
            );
            assert.strictEqual('audience', credentials1.oAuthScope);

            const credentials2 = new MicrosoftGovernmentAppCredentials('appId', 'password');
            assert.strictEqual(
                GovernmentConstants.ToChannelFromBotLoginUrlPrefix + GovernmentConstants.DefaultChannelAuthTenant,
                credentials2.oAuthEndpoint,
            );
            assert.strictEqual(GovernmentConstants.ToChannelFromBotOAuthScope, credentials2.oAuthScope);
        });
    });
});
