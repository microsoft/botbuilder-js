const { MicrosoftAppCredentials, AuthenticationConstants } = require('../..');
const assert = require('assert');

describe('MicrosoftAppCredentialsTestSuite', function () {
    describe('MicrosoftAppCredentialsTestCase', function () {
        it('AssertOAuthEndpointAndOAuthScope', function () {
            const credentials1 = new MicrosoftAppCredentials('appId', 'password', 'tenantId', 'audience');
            assert.strictEqual(
                AuthenticationConstants.ToChannelFromBotLoginUrlPrefix + 'tenantId',
                credentials1.oAuthEndpoint
            );
            assert.strictEqual('audience', credentials1.oAuthScope);

            const credentials2 = new MicrosoftAppCredentials('appId', 'password');
            assert.strictEqual(
                AuthenticationConstants.ToChannelFromBotLoginUrlPrefix +
                    AuthenticationConstants.DefaultChannelAuthTenant,
                credentials2.oAuthEndpoint
            );
            assert.strictEqual(AuthenticationConstants.ToChannelFromBotOAuthScope, credentials2.oAuthScope);
        });
    });
});
