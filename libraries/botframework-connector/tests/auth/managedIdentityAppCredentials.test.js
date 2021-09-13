// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const sinon = require('sinon');
const { JwtTokenProviderFactory } = require('../../lib/auth/jwtTokenProviderFactory');
const { ManagedIdentityAppCredentials } = require('../../lib/auth/managedIdentityAppCredentials');
const { AppCredentials } = require('../../lib/auth/appCredentials');
const { AuthenticationConstants } = require('../../lib/auth/authenticationConstants');

describe('ManagedIdentityAppCredentials', function () {
    const testAppId = 'foo';
    const testAudience = 'bar';

    const testInput = [
        { name: 'null', value: null },
        { name: 'empty', value: '' },
        { name: 'blank', value: ' ' },
    ];
    const errorMsgAppId = 'ManagedIdentityAppCredentials.constructor(): missing appid.';
    const errorMsgToken = 'ManagedIdentityAppCredentials.constructor(): missing tokenProviderFactory.';

    describe('Constructor', function () {
        it('should create credentials with appId and audience', function () {
            const tokenProvider = new JwtTokenProviderFactory();
            const sut = new ManagedIdentityAppCredentials(testAppId, testAudience, tokenProvider);
            assert.strictEqual(testAppId, sut.appId);
            assert.strictEqual(tokenProvider, sut.tokenProviderFactory);
        });

        it('should create credentials without audience', function () {
            const tokenProvider = new JwtTokenProviderFactory();
            const sut = new ManagedIdentityAppCredentials(testAppId, undefined, tokenProvider);
            assert.strictEqual(testAppId, sut.appId);
            assert.strictEqual(AuthenticationConstants.ToChannelFromBotOAuthScope, sut.oAuthScope);
        });

        testInput.forEach(({ name, value }) => {
            it(`should throw if appId is ${name}`, function () {
                const tokenProvider = new JwtTokenProviderFactory();
                assert.throws(() => new ManagedIdentityAppCredentials(value, testAudience, tokenProvider), {
                    name: 'AssertionError',
                    message: errorMsgAppId,
                });
            });
        });

        it('should throw with null tokenProviderFactory', function () {
            assert.throws(() => new ManagedIdentityAppCredentials(testAppId, testAudience, null), {
                name: 'AssertionError',
                message: errorMsgToken,
            });
        });
    });

    describe('getToken', function () {
        it('should refetch token', async function () {
            const tokenProvider = new JwtTokenProviderFactory(testAppId);
            const authResult = {
                token: '123',
                expiresOnTimestamp: Date.now() + 10000, // now + 10 sec.
            };
            tokenProvider.createAzureServiceTokenProvider = sinon.spy(() => ({
                getToken: () => authResult,
            }));

            const sut = new ManagedIdentityAppCredentials(testAppId, testAudience, tokenProvider);

            await sut.getToken(true);
            const expected = AppCredentials.cache.get(sut.tokenCacheKey);

            await sut.getToken();
            const actual = AppCredentials.cache.get(sut.tokenCacheKey);

            assert.notStrictEqual(actual, expected);
        });

        it('should use token from cache', async function () {
            const tokenProvider = new JwtTokenProviderFactory(testAppId);
            const authResult = {
                token: '123',
                expiresOnTimestamp: Date.now() + 310000, // now + 5 min and 10 sec.
            };
            tokenProvider.createAzureServiceTokenProvider = sinon.spy(() => ({
                getToken: () => authResult,
            }));

            const sut = new ManagedIdentityAppCredentials(testAppId, testAudience, tokenProvider);

            await sut.getToken(true);
            const expected = AppCredentials.cache.get(sut.tokenCacheKey);

            await sut.getToken();
            const actual = AppCredentials.cache.get(sut.tokenCacheKey);

            assert.strictEqual(actual, expected);
        });
    });
});
