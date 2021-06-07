// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const {
    AuthenticationConstants,
    BotFrameworkAuthentication,
    BotFrameworkAuthenticationFactory,
    GovernmentConstants,
} = require('../');

describe('BotFrameworkAuthenticationFactory', function () {
    it('should create anonymous BotFrameworkAuthentication', function () {
        const bfA = BotFrameworkAuthenticationFactory.create();
        assert(bfA instanceof BotFrameworkAuthentication);
    });

    it('should create BotFrameworkAuthentication configured for valid channel services', function () {
        const bfA = BotFrameworkAuthenticationFactory.create('');
        assert.strictEqual(bfA.getOriginatingAudience(), AuthenticationConstants.ToChannelFromBotOAuthScope);

        const gBfA = BotFrameworkAuthenticationFactory.create(GovernmentConstants.ChannelService);
        assert.strictEqual(gBfA.getOriginatingAudience(), GovernmentConstants.ToChannelFromBotOAuthScope);
    });

    it('should throw with an unknown channel service', function () {
        assert.throws(
            () => BotFrameworkAuthenticationFactory.create('unknown'),
            new Error('The provided ChannelService value is not supported.')
        );
    });
});
