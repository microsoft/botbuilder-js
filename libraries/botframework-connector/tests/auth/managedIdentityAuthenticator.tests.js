// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const sinon = require('sinon');
const { ManagedIdentityAuthenticator } = require('../../lib/auth/managedIdentityAuthenticator');
const { JwtTokenProviderFactory } = require('../../lib/auth/jwtTokenProviderFactory');

const testAppId = 'foo';
const testAudience = 'bar';
const testAzureAdInstance = 'https://login.microsoftonline.com/';

const tokenProvider = new JwtTokenProviderFactory(testAppId);
tokenProvider.createAzureServiceTokenProvider = sinon.spy();

const testInput = [
    { name: 'null', value: null },
    { name: 'empty', value: '' },
    { name: 'blank', value: ' ' }
];

const errorMsgAppId = 'ManagedIdentityAuthenticator.constructor(): missing appid.';
const errorMsgAudience = 'ManagedIdentityAuthenticator.constructor(): missing resource.';
const errorMsgToken = 'ManagedIdentityAuthenticator.constructor(): missing tokenProviderFactory.';

describe('ManagedIdentityAuthenticator', function () {
    describe('Constructor', function () {
        it('should call createAzureServiceTokenProvider', function () {
            var sut = new ManagedIdentityAuthenticator(testAppId, testAudience, tokenProvider);
            assert.strictEqual(testAudience, sut.resource);
            assert.strictEqual(tokenProvider.createAzureServiceTokenProvider.calledOnce, true);
        });

        testInput.forEach(({name, value}) => {
            it(`should throw if appId is ${ name }`, function () {
                assert.throws(() => new ManagedIdentityAuthenticator(value, testAudience, tokenProvider), {
                    name: 'Error',
                    message: errorMsgAppId,
                });
            });
        });

        testInput.forEach(({name, value}) => {
            it(`should throw if audience is ${ name }`, function () {
                assert.throws(() => new ManagedIdentityAuthenticator(testAppId, value, tokenProvider), {
                    name: 'Error',
                    message: errorMsgAudience,
                });
            });
        });

        it('should throw with null tokenProviderFactory', function () {
            assert.throws(() => new ManagedIdentityAuthenticator(testAppId, testAudience, null), {
                name: 'Error',
                message: errorMsgToken,
            });
        });
    });
});
