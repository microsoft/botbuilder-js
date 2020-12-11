// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthenticationConfiguration } from './authenticationConfiguration';
import { AuthenticationConstants } from './authenticationConstants';
import { CallerIdConstants } from 'botframework-schema';
import { ChannelValidation } from './channelValidation';
import { ParameterizedBotFrameworkAuthentication } from './parameterizedBotFrameworkAuthentication';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { VerifyOptions } from 'jsonwebtoken';
import { emulatorAuthValidator } from './emulatorValidation';
import { emulatorSkillAuthValidator } from './skillValidation';
import { makeAuthValidator } from './authValidator';

export class PublicCloudBotFrameworkAuthentication extends ParameterizedBotFrameworkAuthentication {
    constructor(
        credentialFactory: ServiceClientCredentialsFactory,
        authConfiguration: AuthenticationConfiguration,
        verifyOptions?: Partial<VerifyOptions>
    ) {
        const authValidator = makeAuthValidator(
            Object.assign({}, ChannelValidation.ToBotFromChannelTokenValidationParameters, verifyOptions),
            AuthenticationConstants.ToBotFromChannelOpenIdMetadataUrl, // TODO: configurable
            async (credentials, identity) => {
                await ChannelValidation.validateIdentity(identity, credentials);
            }
        );

        super(
            credentialFactory,
            authConfiguration,
            true,
            AuthenticationConstants.ToChannelFromBotLoginUrl,
            AuthenticationConstants.ToChannelFromBotOAuthScope,
            CallerIdConstants.PublicAzureChannel,
            authValidator,
            emulatorAuthValidator,
            emulatorSkillAuthValidator
        );
    }
}
