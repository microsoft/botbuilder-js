// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const url = require('url');
const { JwtTokenExtractor } = require('../../lib/auth/jwtTokenExtractor');
const { jwt, oauth } = require('botbuilder-test-utils');

const {
    AuthenticationConstants,
    ChannelValidation,
    EmulatorValidation,
    GovernmentChannelValidation,
    GovernmentConstants,
    JwtTokenValidation,
    SimpleCredentialProvider,
    MicrosoftAppCredentials,
} = require('../..');

describe('JwtTokenValidation', function () {
    beforeEach(function () {
        JwtTokenExtractor.openIdMetadataCache.clear();
    });

    jwt.mocha();
    oauth.mocha();

    describe('authenticateRequest', function () {
        const authenticateRequest = async ({
            appId = 'appId',
            appPassword = 'password',
            assertClaims = (claims) => assert(claims.isAuthenticated),
            channelService,
            makeActivity = () => ({}),
            makeAuthHeader = (tokenType, accessToken) => `${tokenType} ${accessToken}`,
            makeClaims = (appId, defaultClaims) => defaultClaims,
            makeCredentials = (appId, appPassword, tenant) => new MicrosoftAppCredentials(appId, appPassword, tenant),
            makeProvider = (appId, appPassword) => new SimpleCredentialProvider(appId, appPassword),
            metadata,
            parameters,
            rejectsWith,
            skippedJwt = false,
            tenant,
            version = '1.0',
        }) => {
            // Stub OpenID/JWKS calls so that we can generate signed JWTs in the tests
            const { sign, verify: verifyJwt } = jwt.stub({
                issuer: parameters.issuer[0],
                metadata: url.parse(metadata),
            });

            const credentials = makeCredentials(appId, appPassword, tenant);
            const activity = makeActivity();

            // Stub oauth calls with nock. The received token is the signed claims generated by the caller.
            const { verify: verifyOauth, tokenType } = oauth.stub({
                accessToken: sign(
                    makeClaims(appId, {
                        [AuthenticationConstants.ServiceUrlClaim]: activity.serviceUrl,
                        [AuthenticationConstants.VersionClaim]: version,
                        tid: tenant,
                    })
                ),
                tenant,
            });

            // Fetch "stubbed" token
            const accessToken = await credentials.getToken(true);

            // Ensure all oauth expectations are met
            verifyOauth();

            const provider = makeProvider(appId, appPassword);

            // Do not await so that we support expecting resolution or rejection
            const promise = JwtTokenValidation.authenticateRequest(
                activity,
                makeAuthHeader(tokenType, accessToken),
                provider,
                channelService
            );

            // Assert expected results
            if (rejectsWith) {
                await assert.rejects(promise, rejectsWith);
            } else {
                assertClaims(await promise);
            }

            // Ensure all JWT expectations are met
            verifyJwt(skippedJwt);
        };

        const makeAppIdClaims = (appId, defaultClaims) => ({
            ...defaultClaims,
            [AuthenticationConstants.AppIdClaim]: appId,
        });

        const makeAudClaims = (appId, defaultClaims) => ({
            ...defaultClaims,
            [AuthenticationConstants.AudienceClaim]: appId,
        });

        const generateTests = (makeClaims) => [
            {
                makeClaims,
            },
            {
                label: 'fails when claimed app ID differs from credentials app ID',
                makeClaims: (appId, defaultClaims) => makeClaims('unexpectedAppId', defaultClaims),
                rejectsWith: {
                    message: 'Unauthorized. Invalid AppId passed on token: unexpectedAppId',
                },
            },
            {
                label: 'fails with empty auth header',
                makeAuthHeader: () => '',
                makeClaims,
                rejectsWith: {
                    message: 'Unauthorized Access. Request is not authorized',
                },
                skippedJwt: true,
            },
            {
                assertClaims: (claims) => {
                    assert(claims.isAuthenticated);
                    assert.strictEqual(claims.getClaimValue('tid'), 'tenant.com');
                },
                label: 'succeeds with a specific tenant',
                makeClaims,
                tenant: 'tenant.com',
            },
            {
                assertClaims: (claims) => {
                    assert(claims.isAuthenticated);
                    assert.strictEqual(
                        claims.getClaimValue(AuthenticationConstants.ServiceUrlClaim),
                        'https://service.url'
                    );
                },
                label: 'succeeds with a specific tenant',
                makeActivity: () => ({ serviceUrl: 'https://service.url' }),
                makeClaims,
            },
            {
                assertClaims: (claims) => {
                    assert(claims.isAuthenticated);
                    assert.deepStrictEqual(claims.claims, []);
                },
                label: 'succeeds with anonymous auth',
                makeAuthHeader: () => '',
                makeClaims,
                makeProvider: () => new SimpleCredentialProvider(),
                skippedJwt: true,
            },
        ];

        const testGroups = [
            {
                label: 'Emulator',
                metadata: AuthenticationConstants.ToBotFromEmulatorOpenIdMetadataUrl,
                parameters: EmulatorValidation.ToBotFromEmulatorTokenValidationParameters,
                tests: [
                    ...generateTests(makeAppIdClaims),
                    {
                        label: 'fails with missing app ID claim',
                        rejectsWith: {
                            message: 'Unauthorized. "appid" claim is required on Emulator Token version "1.0".',
                        },
                    },
                ],
            },
            {
                label: 'Public Cloud',
                metadata: AuthenticationConstants.ToBotFromChannelOpenIdMetadataUrl,
                parameters: ChannelValidation.ToBotFromChannelTokenValidationParameters,
                tests: [
                    ...generateTests(makeAudClaims),
                    {
                        label: 'fails with missing app ID claim',
                        rejectsWith: {
                            message: 'Unauthorized. Invalid AppId passed on token: null',
                        },
                    },
                ],
            },
            {
                label: 'Government Cloud',
                channelService: GovernmentConstants.ChannelService,
                metadata: GovernmentConstants.ToBotFromChannelOpenIdMetadataUrl,
                parameters: GovernmentChannelValidation.ToBotFromGovernmentChannelTokenValidationParameters,
                tests: [
                    ...generateTests(makeAudClaims),
                    {
                        label: 'fails with missing app ID claim',
                        rejectsWith: {
                            message: 'Unauthorized. Invalid AppId passed on token: null',
                        },
                    },
                ],
            },
        ];

        testGroups.forEach(({ label, only, tests = [], ...groupParams }) => {
            const register = only ? describe.only : describe;
            register(label, () => {
                tests.forEach(({ label = 'succeeds', only, ...testParams }) => {
                    const register = only ? it.only : it;
                    register(label, () => authenticateRequest({ ...groupParams, ...testParams }));
                });
            });
        });
    });
});
