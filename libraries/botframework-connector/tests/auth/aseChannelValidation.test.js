const {
    AseChannelValidation,
    GovernmentConstants,
    AuthenticationConstants,
    BetweenBotAndAseChannelTokenValidationParameters,
} = require('../..');
const assert = require('assert');

describe('AseChannelTestSuite', function () {
    describe('AseChannelTestCase', function () {
        it('ValidationMetadataUrlTest_AseChannel_USGov', function () {
            const config = {
                ChannelService: GovernmentConstants.ChannelService,
            };
            AseChannelValidation.init(config);
            assert.strictEqual(
                AseChannelValidation.MetadataUrl,
                GovernmentConstants.ToBotFromEmulatorOpenIdMetadataUrl
            );
        });

        it('ValidationMetadataUrlTest_AseChannel_Public', function () {
            const config = {};
            AseChannelValidation.init(config);
            assert.strictEqual(
                AseChannelValidation.MetadataUrl,
                AuthenticationConstants.ToBotFromEmulatorOpenIdMetadataUrl
            );
        });

        it('ValidationIssueUrlTest_AseChannel', function () {
            const config = {
                MicrosoftAppTenantId: 'testTenantId',
            };
            AseChannelValidation.init(config);
            const tenantIds = [
                'testTenantId',
                'f8cdef31-a31e-4b4a-93e4-5f571e91255a', // US Gov MicrosoftServices.onmicrosoft.us
                'd6d49420-f39b-4df7-a1dc-d59a935871db', // Public botframework.com
            ];
            tenantIds.forEach(function (tmpId) {
                assert.strictEqual(
                    true,
                    BetweenBotAndAseChannelTokenValidationParameters.issuer.includes(
                        `https://sts.windows.net/${tmpId}/`
                    )
                );
                assert.strictEqual(
                    true,
                    BetweenBotAndAseChannelTokenValidationParameters.issuer.includes(
                        `https://login.microsoftonline.com/${tmpId}/v2.0`
                    )
                );
                assert.strictEqual(
                    true,
                    BetweenBotAndAseChannelTokenValidationParameters.issuer.includes(
                        `https://login.microsoftonline.us/${tmpId}/v2.0`
                    )
                );
            });
        });

        it('ValidationChannelIdTest_AseChannel', function () {
            assert.strictEqual(true, AseChannelValidation.isTokenFromAseChannel('AseChannel'));
        });
    });
});
