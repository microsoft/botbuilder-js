// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthenticationConfiguration } from './authenticationConfiguration';
import { CallerIdConstants } from 'botframework-schema';
import { GovernmentConstants } from './governmentConstants';
import { ParameterizedBotFrameworkAuthentication } from './parameterizedBotFrameworkAuthentication';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { VerifyOptions } from 'jsonwebtoken';
import { governmentEmulatorAuthValidator } from './emulatorValidation';
import { governmentSkillAuthValidator } from './skillValidation';
import { makeGovernmentAuthValidator } from './governmentChannelValidation';

export class GovernmentCloudBotFrameworkAuthentication extends ParameterizedBotFrameworkAuthentication {
    constructor(
        credentialFactory: ServiceClientCredentialsFactory,
        authConfiguration: AuthenticationConfiguration,
        verifyOptions?: Partial<VerifyOptions>,
        openIdMetadataUrl?: string
    ) {
        const authHeaderValidator = makeGovernmentAuthValidator(
            openIdMetadataUrl ?? GovernmentConstants.ToBotFromChannelOpenIdMetadataUrl,
            verifyOptions
        );

        super(
            credentialFactory,
            authConfiguration,
            true,
            GovernmentConstants.ToChannelFromBotLoginUrl,
            GovernmentConstants.ToChannelFromBotOAuthScope,
            CallerIdConstants.USGovChannel,
            authHeaderValidator,
            governmentEmulatorAuthValidator,
            governmentSkillAuthValidator
        );
    }
}
