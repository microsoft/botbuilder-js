// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthHeaderValidator } from './authHeaderValidator';
import { AuthenticationConfiguration } from './authenticationConfiguration';
import { BotFrameworkAuthentication } from './botFrameworkAuthentication';
import { GovernmentCloudBotFrameworkAuthentication } from './governmentCloudBotFrameworkAuthentication';
import { GovernmentConstants } from './governmentConstants';
import { ParameterizedBotFrameworkAuthentication } from './parameterizedBotFrameworkAuthentication';
import { PublicCloudBotFrameworkAuthentication } from './publicCloudBotFrameworkAuthentication';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';

// A helper class for creating BotFrameworkAuthentication instances.
export class BotFrameworkAuthenticationFactory {
    /**
     * Create a BotFrameworkAuthentication instance that is appropriate based on the
     * passed in arguments.
     *
     * @param {string} channelService the channel service
     * @param {boolean} validateAuthority whether or not validate the authority
     * @param {string} callerId caller ID
     * @param {string} toChannelFromBotLoginUrl login url for messages from bot to channel
     * @param {string} toChannelFromBotOAuthScope oauth scope for messages from bot to channel
     * @param {AuthHeaderValidator} authHeaderValidator auth validator for general requests
     * @param {AuthHeaderValidator} emulatorAuthHeaderValidator auth validator for emulator requests
     * @param {AuthHeaderValidator} skillAuthHeaderValidator auth validator for skill requests
     * @param {ServiceClientCredentialsFactory} credentialFactory the credential factory to use
     * @param {AuthenticationConfiguration} authConfiguration the auth configuration to use
     * @returns {BotFrameworkAuthentication} the appropriate BotFrameworkAuthentication instance
     */
    static create(
        channelService?: string,
        validateAuthority?: boolean,
        callerId?: string,
        toChannelFromBotLoginUrl?: string,
        toChannelFromBotOAuthScope?: string,
        authHeaderValidator?: AuthHeaderValidator,
        emulatorAuthHeaderValidator?: AuthHeaderValidator,
        skillAuthHeaderValidator?: AuthHeaderValidator,
        credentialFactory?: ServiceClientCredentialsFactory,
        authConfiguration?: AuthenticationConfiguration
    ): BotFrameworkAuthentication {
        if (
            validateAuthority ||
            callerId ||
            toChannelFromBotLoginUrl ||
            toChannelFromBotOAuthScope ||
            authHeaderValidator ||
            emulatorAuthHeaderValidator ||
            skillAuthHeaderValidator
        ) {
            return new ParameterizedBotFrameworkAuthentication(
                credentialFactory,
                authConfiguration,
                validateAuthority,
                toChannelFromBotLoginUrl,
                toChannelFromBotOAuthScope,
                callerId,
                authHeaderValidator,
                emulatorAuthHeaderValidator,
                skillAuthHeaderValidator
            );
        } else {
            if (!channelService) {
                return new PublicCloudBotFrameworkAuthentication(credentialFactory, authConfiguration);
            } else if (channelService === GovernmentConstants.ChannelService) {
                return new GovernmentCloudBotFrameworkAuthentication(credentialFactory, authConfiguration);
            } else {
                throw new TypeError('The provided ChannelService value is not supported');
            }
        }
    }
}
