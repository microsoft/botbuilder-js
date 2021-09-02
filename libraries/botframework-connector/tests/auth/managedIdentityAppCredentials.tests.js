// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const { JwtTokenProviderFactoryInterface } = require('../../lib/auth/jwtTokenProviderFactoryInterface');
const { JwtTokenProviderFactory } = require('../../lib/auth/jwtTokenProviderFactory');
const { ManagedIdentityAppCredentials } = require('../../lib/auth/managedIdentityAppCredentials');
const { AuthenticationConstants } = require('../../lib/auth/authenticationConstants');

describe('ManagedIdentityAppCredentials', function () {
    const testAppId = 'foo';
    const testAudience = 'bar';

    const testInput = [
            { name: 'null', value: null },
            { name: 'empty', value: '' },
            { name: 'blank', value: ' ' }
        ];
    const errorMsgAppId = 'ManagedIdentityAppCredentials.constructor(): missing appid.';
    const errorMsgToken = 'ManagedIdentityAppCredentials.constructor(): missing tokenProviderFactory.';

    describe('Constructor', function () {
        it('should create credentials with appId and audience', function () { 
            var tokenProvider = new JwtTokenProviderFactory();
            var sut = new ManagedIdentityAppCredentials(testAppId, testAudience, tokenProvider);
            assert.strictEqual(testAppId, sut.appId);
            assert.strictEqual(tokenProvider, sut.tokenProviderFactory);
        });

        it('should create credentials without audience', function () { 
            var tokenProvider = new JwtTokenProviderFactory();
            var sut = new ManagedIdentityAppCredentials(testAppId, undefined, tokenProvider);
            assert.strictEqual(testAppId, sut.appId);
            assert.strictEqual(AuthenticationConstants.ToChannelFromBotOAuthScope, sut.oAuthScope);
        });

        testInput.forEach(({name, value}) => {
            it(`should throw if appId is ${ name }`, function () {
                var tokenProvider = new JwtTokenProviderFactory();
                assert.throws(() => new ManagedIdentityAppCredentials(value, testAudience, tokenProvider), {
                    name: 'Error',
                    message: errorMsgAppId,
                });
            });
        });

        it ('should throw with null tokenProviderFactory', function () {
            assert.throws(() => new ManagedIdentityAppCredentials(testAppId, testAudience, null), {
                name: 'Error',
                message: errorMsgToken,
            });
        });
    });
});
