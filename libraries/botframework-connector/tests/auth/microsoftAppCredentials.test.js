const { MicrosoftAppCredentials, AuthenticationConstants } = require('../..');
const assert = require('assert');

describe('MicrosoftAppCredentialsTestSuite', function () {
    describe('MicrosoftAppCredentialsTestCase', function () {
        it('AssertOAuthEndpointAndOAuthScope', function() {
            var credentials = new MicrosoftAppCredentials("appId", "password", "tenantId", "audience");
            assert.strictEqual(AuthenticationConstants.ToChannelFromBotLoginUrlPrefix + "tenantId", credentials.oAuthEndpoint);
            assert.strictEqual("audience", credentials.oAuthScope);

            var credentials = new MicrosoftAppCredentials("appId", "password");
            assert.strictEqual(AuthenticationConstants.ToChannelFromBotLoginUrlPrefix + AuthenticationConstants.DefaultChannelAuthTenant, credentials.oAuthEndpoint);
            assert.strictEqual(AuthenticationConstants.ToChannelFromBotOAuthScope, credentials.oAuthScope);
          });

    });
});
