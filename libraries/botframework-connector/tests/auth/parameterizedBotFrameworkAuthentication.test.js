// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const url = require('url');
const { JwtTokenExtractor } = require('../../lib/auth/jwtTokenExtractor');
const { StatusCodes } = require('botframework-schema');
const { jwt, oauth } = require('botbuilder-test-utils');

const {
    AuthenticationConfiguration,
    AuthenticationConstants,
    AuthenticationError,
    GovernmentCloudBotFrameworkAuthentication,
    GovernmentConstants,
    PasswordServiceClientCredentialFactory,
    PublicCloudBotFrameworkAuthentication,
    UnauthorizedAccessError,
} = require('../..');

describe('ParameterizedBotFrameworkAuthentication', () => {
    describe('derived classes', () => {
        afterEach(() => {
            JwtTokenExtractor.openIdMetadataCache.clear();
        });

        jwt.mocha();
        oauth.mocha();

        const authenticateRequest = async ({
            activity = {},
            appId = 'appId',
            appPassword = 'password',
            assertResult = (result) => assert(result.claimsIdentity.isAuthenticated),
            authCtor,
            channelService,
            issuer,
            makeAuthHeader = (tokenType, accessToken) => `${tokenType} ${accessToken}`,
            makeClaims = (appId, defaultClaims) => ({
                ...defaultClaims,
                [AuthenticationConstants.AudienceClaim]: appId,
            }),
            makeFactory = (appId, appPassword) => new PasswordServiceClientCredentialFactory(appId, appPassword),
            metadata,
            rejectsWith,
            skippedJwt = false,
        } = {}) => {
            const { sign, verify } = jwt.stub({
                issuer,
                metadata: url.parse(metadata),
            });

            const { accessToken, tokenType } = oauth.stub({
                accessToken: sign(makeClaims(appId, {})),
            });

            const factory = makeFactory(appId, appPassword);
            const config = new AuthenticationConfiguration();
            const auth = new authCtor(factory, config, channelService);

            const promise = auth.authenticateRequest(activity, makeAuthHeader(tokenType, accessToken));

            if (rejectsWith) {
                await assert.rejects(promise, rejectsWith);
            } else {
                assertResult(await promise);
            }

            verify(skippedJwt);
        };

        const generateTests = () => [
            { label: 'succeeds' },
            {
                label: 'fails when claimed app ID differs from configured app ID',
                makeClaims: (appId, defaultClaims) => ({
                    ...defaultClaims,
                    [AuthenticationConstants.AudienceClaim]: 'differentAppId',
                }),
                rejectsWith: new AuthenticationError(
                    'Unauthorized. Invalid AppId passed on token: differentAppId',
                    StatusCodes.UNAUTHORIZED
                ),
            },
            {
                label: 'fails early with empty auth header',
                makeAuthHeader: () => '',
                rejectsWith: new AuthenticationError(
                    'Unauthorized Access. Request is not authorized',
                    StatusCodes.UNAUTHORIZED
                ),
                skippedJwt: true,
            },
            {
                label: 'succeeds with anonymous auth',
                makeAuthHeader: () => '',
                makeFactory: () => new PasswordServiceClientCredentialFactory(),
                skippedJwt: true,
            },
        ];

        const derivedClassTests = [
            {
                authCtor: PublicCloudBotFrameworkAuthentication,
                issuer: AuthenticationConstants.ToBotFromChannelTokenIssuer,
                label: 'PublicCloudBotFrameworkAuthentication',
                metadata: AuthenticationConstants.ToBotFromChannelOpenIdMetadataUrl,
                tests: generateTests(),
            },
            {
                authCtor: GovernmentCloudBotFrameworkAuthentication,
                channelService: GovernmentConstants.ChannelService,
                issuer: GovernmentConstants.ToBotFromChannelTokenIssuer,
                label: 'GovernmentCloudBotFrameworkAuthentication',
                metadata: GovernmentConstants.ToBotFromChannelOpenIdMetadataUrl,
                tests: generateTests(true),
            },
        ];

        derivedClassTests.forEach(({ label, only, tests = [], ...derivedParams }) => {
            const register = only ? describe.only : describe;
            register(label, () => {
                register('authenticateRequest', () => {
                    tests.forEach(({ label = 'succeeds', only, ...testParams }) => {
                        const register = only ? it.only : it;
                        register(label, () => authenticateRequest({ ...derivedParams, ...testParams }));
                    });
                });
            });
        });
    });
});
