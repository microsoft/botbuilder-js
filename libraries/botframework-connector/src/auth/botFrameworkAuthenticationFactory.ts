// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthenticationConfiguration } from './authenticationConfiguration';
import { AuthenticationConstants } from './authenticationConstants';
import { BotFrameworkAuthentication } from './botFrameworkAuthentication';
import { ChannelValidation } from './channelValidation';
import { GovernmentCloudBotFrameworkAuthentication } from './governmentCloudBotFrameworkAuthentication';
import { GovernmentConstants } from './governmentConstants';
import { JwtTokenExtractor } from './jwtTokenExtractor';
import { ParameterizedBotFrameworkAuthentication } from './parameterizedBotFrameworkAuthentication';
import { PublicCloudBotFrameworkAuthentication } from './publicCloudBotFrameworkAuthentication';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { AuthValidator, makeAuthValidator } from './authValidator';
import { EmulatorValidation } from './emulatorValidation';
import { makeSkillAuthValidator } from './skillValidation';

// A helper class for creating BotFrameworkAuthentication instances.
export class BotFrameworkAuthenticationFactory {
    /**
     * Create a BotFrameworkAuthentication instance that is appropriate based on the
     * passed in arguments.
     *
     * @param {ServiceClientCredentialsFactory} credentialFactory the credential factory to use
     * @param {AuthenticationConfiguration} authConfiguration the auth configuration to use
     * @param {boolean} validateAuthority whether or not validate the authority
     * @param {string} callerId caller ID
     * @param {string} channelService the channel service
     * @param {string} toChannelFromBotLoginUrl login url for messages from bot to channel
     * @param {string} toChannelFromBotOAuthScope oauth scope for messages from bot to channel
     * @param {AuthValidator} authValidator auth validator for general requests
     * @param {AuthValidator} emulatorAuthValidator auth validator for emulator requests
     * @param {AuthValidator} skillAuthValidator auth validator for skill requests
     * @returns {BotFrameworkAuthentication} the appropriate BotFrameworkAuthentication instance
     */
    static create(
        channelService?: string,
        validateAuthority?: boolean,
        callerId?: string,
        toChannelFromBotLoginUrl?: string,
        toChannelFromBotOAuthScope?: string,
        authValidator?: AuthValidator,
        emulatorAuthValidator?: AuthValidator,
        skillAuthValidator?: AuthValidator,
        credentialFactory?: ServiceClientCredentialsFactory,
        authConfiguration?: AuthenticationConfiguration
    ): BotFrameworkAuthentication {
        if (
            validateAuthority ||
            callerId ||
            toChannelFromBotLoginUrl ||
            toChannelFromBotOAuthScope ||
            authValidator ||
            emulatorAuthValidator ||
            skillAuthValidator
        ) {
            return new ParameterizedBotFrameworkAuthentication(
                credentialFactory,
                authConfiguration,
                validateAuthority,
                toChannelFromBotLoginUrl,
                toChannelFromBotOAuthScope,
                callerId,
                authValidator,
                emulatorAuthValidator,
                skillAuthValidator
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
