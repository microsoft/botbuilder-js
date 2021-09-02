// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const { JwtTokenProviderFactory } = require('../../lib/auth/jwtTokenProviderFactory');

const appId = [
    { name: 'null', value: null },
    { name: 'empty', value: '' },
    { name: 'blank', value: ' ' }
];
const errorMsg = 'jwtTokenProviderFactory.createAzureServiceTokenProvider(): missing appid.';

describe('JwtTokenProviderFactory', function () {
    const testAppId = 'foo';

    describe('CreateAzureServiceTokenProvider', function () {
        it('can create with appId', async function () {
            var sut = new JwtTokenProviderFactory();
            var tokenProvider = sut.createAzureServiceTokenProvider(testAppId);
            assert.notStrictEqual(tokenProvider, null);
        });

        appId.forEach(({name, value}) => {
            it(`should throw if appId is ${ name }`, function () {
                var sut = new JwtTokenProviderFactory();
                assert.throws(() => sut.createAzureServiceTokenProvider(value), {
                    name: 'Error',
                    message: errorMsg,
                });
            });
        });
    });
});
