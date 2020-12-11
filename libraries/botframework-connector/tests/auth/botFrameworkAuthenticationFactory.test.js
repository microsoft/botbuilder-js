// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');

const {
    BotFrameworkAuthenticationFactory,
    GovernmentCloudBotFrameworkAuthentication,
    GovernmentConstants,
    ParameterizedBotFrameworkAuthentication,
    PublicCloudBotFrameworkAuthentication,
} = require('../..');

describe('BotFrameworkAuthenticationFactory', () => {
    it('creates a public cloud instance', () => {
        assert(BotFrameworkAuthenticationFactory.create() instanceof PublicCloudBotFrameworkAuthentication);
    });

    it('creates a gov cloud instance', () => {
        assert(
            BotFrameworkAuthenticationFactory.create(GovernmentConstants.ChannelService) instanceof
                GovernmentCloudBotFrameworkAuthentication
        );
    });

    it('creates a parameterized instance', () => {
        assert(
            BotFrameworkAuthenticationFactory.create(undefined, false, 'something') instanceof
                ParameterizedBotFrameworkAuthentication
        );
    });
});
