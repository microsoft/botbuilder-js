// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const { ManagedIdentityServiceClientCredentialsFactory } = require('../../lib/auth/managedIdentityServiceClientCredentialsFactory');
const { JwtTokenProviderFactory } = require('../../lib/auth/jwtTokenProviderFactory');

const testAppId = 'foo';
const testAudience = 'bar';
const testTokenProvider = new JwtTokenProviderFactory(testAppId);

const testInput = [
    { name: 'null', value: null },
    { name: 'empty', value: '' },
    { name: 'blank', value: ' ' }
];
const errorMsgAppId = 'ManagedIdentityServiceClientCredentialsFactory.constructor(): missing appid.';
const errorMsgToken = 'ManagedIdentityServiceClientCredentialsFactory.constructor(): missing tokenProviderFactory.';

describe('ManagedIdentityServiceClientCredentialsFactory', function () {
    describe('Constructor', function () {
        it('succeeds with appId and tokenProvider', async function () {
            var sut = new ManagedIdentityServiceClientCredentialsFactory(testAppId, testTokenProvider);
            assert.strictEqual(testAppId, sut.appId);
            assert.strictEqual(testTokenProvider, sut.tokenProviderFactory);
        });

        testInput.forEach(({name, value}) => {
            it(`should throw if appId is ${ name }`, function () {
                assert.throws(() =>  new ManagedIdentityServiceClientCredentialsFactory(value, testTokenProvider), {
                    name: 'Error',
                    message: errorMsgAppId,
                });
            });
        });

        it('should throw with null tokenProviderFactory', function () {
            assert.throws(() => new ManagedIdentityServiceClientCredentialsFactory(testAppId, null), {
                name: 'Error',
                message: errorMsgToken,
            });
        });
    });

    describe('IsValidAppId', function () {
        it('should be valid', async function () {
            var sut = new ManagedIdentityServiceClientCredentialsFactory(testAppId, testTokenProvider);
            assert.strictEqual(true, await sut.isValidAppId(testAppId));
        });

        it('should not be valid', async function () {
            var sut = new ManagedIdentityServiceClientCredentialsFactory(testAppId, testTokenProvider);
            assert.strictEqual(false, await sut.isValidAppId('invalidAppId'));
        });
    });

    describe('IsAuthenticationDisabled', function () {
        it('should not be disabled', async function () {
            var sut = new ManagedIdentityServiceClientCredentialsFactory(testAppId, testTokenProvider);
            assert.strictEqual(false, await sut.isAuthenticationDisabled());
        });
    });

    describe('CreateCredentials', function () {
        it('should create credentials', async function () {
            var sut = new ManagedIdentityServiceClientCredentialsFactory(testAppId, testTokenProvider);
            var credentials = await sut.createCredentials(testAppId, testAudience);
            assert.notStrictEqual(null, credentials);
        });

        it('should throw with invalid appId', async function () {
            var sut = new ManagedIdentityServiceClientCredentialsFactory(testAppId, testTokenProvider);
            await assert.rejects(
                sut.createCredentials('invalidAppId', testAudience),
                new Error('ManagedIdentityServiceClientCredentialsFactory.createCredentials(): Invalid Managed ID.')
            );
        });
    });
});
