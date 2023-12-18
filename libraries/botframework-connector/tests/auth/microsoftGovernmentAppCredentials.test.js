const { MicrosoftGovernmentAppCredentials, GovernmentConstants } = require('../..');
const assert = require('assert');

describe('MicrosoftGovernmentAppCredentialsTestSuite', function () {
    describe('MicrosoftGovernmentAppCredentialsTestCase', function () {
        it('AssertOAuthEndpointAndOAuthScope', function() {
            var credentials = new MicrosoftGovernmentAppCredentials("appId", "password", "tenantId", "audience");
            assert.strictEqual(GovernmentConstants.ToChannelFromBotLoginUrlPrefix + "tenantId", credentials.oAuthEndpoint);
            assert.strictEqual("audience", credentials.oAuthScope);

            var credentials = new MicrosoftGovernmentAppCredentials("appId", "password");
            assert.strictEqual(GovernmentConstants.ToChannelFromBotLoginUrlPrefix + GovernmentConstants.DefaultChannelAuthTenant, credentials.oAuthEndpoint);
            assert.strictEqual(GovernmentConstants.ToChannelFromBotOAuthScope, credentials.oAuthScope);
          });

    });
});
