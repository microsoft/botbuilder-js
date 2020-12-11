// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthenticationConfiguration } from './authenticationConfiguration';
import { CallerIdConstants } from 'botframework-schema';
import { GovernmentChannelValidation } from './governmentChannelValidation';
import { GovernmentConstants } from './governmentConstants';
import { ParameterizedBotFrameworkAuthentication } from './parameterizedBotFrameworkAuthentication';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { VerifyOptions } from 'jsonwebtoken';
import { governmentEmulatorAuthValidator } from './emulatorValidation';
import { governmentSkillAuthValidator } from './skillValidation';
import { makeAuthValidator } from './authValidator';

export class GovernmentCloudBotFrameworkAuthentication extends ParameterizedBotFrameworkAuthentication {
    constructor(
        credentialFactory: ServiceClientCredentialsFactory,
        authConfiguration: AuthenticationConfiguration,
        verifyOptions?: Partial<VerifyOptions>,
        openIdMetadataUrl?: string
    ) {
        const authValidator = makeAuthValidator(
            Object.assign(
                {},
                GovernmentChannelValidation.ToBotFromGovernmentChannelTokenValidationParameters,
                verifyOptions
            ),
            openIdMetadataUrl ?? GovernmentConstants.ToBotFromChannelOpenIdMetadataUrl,
            async (credentials, identity) => {
                await GovernmentChannelValidation.validateIdentity(identity, credentials);
            }
        );

        super(
            credentialFactory,
            authConfiguration,
            true,
            GovernmentConstants.ToChannelFromBotLoginUrl,
            GovernmentConstants.ToChannelFromBotOAuthScope,
            CallerIdConstants.USGovChannel,
            authValidator,
            governmentEmulatorAuthValidator,
            governmentSkillAuthValidator
        );
    }
}
