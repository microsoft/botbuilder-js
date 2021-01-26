// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthenticationConfiguration } from './authenticationConfiguration';
import { AuthenticationConstants } from './authenticationConstants';
import { CallerIdConstants } from 'botframework-schema';
import { ParameterizedBotFrameworkAuthentication } from './parameterizedBotFrameworkAuthentication';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { VerifyOptions } from 'jsonwebtoken';
import { emulatorAuthValidator } from './emulatorValidation';
import { emulatorSkillAuthValidator } from './skillValidation';
import { makeChannelAuthValidator } from './channelValidation';

export class PublicCloudBotFrameworkAuthentication extends ParameterizedBotFrameworkAuthentication {
    constructor(
        credentialFactory: ServiceClientCredentialsFactory,
        authConfiguration: AuthenticationConfiguration,
        verifyOptions?: Partial<VerifyOptions>,
        openIdMetadataUrl?: string
    ) {
        const authHeaderValidator = makeChannelAuthValidator(
            openIdMetadataUrl ?? AuthenticationConstants.ToBotFromChannelOpenIdMetadataUrl,
            verifyOptions,
        );

        super(
            credentialFactory,
            authConfiguration,
            true,
            AuthenticationConstants.ToChannelFromBotLoginUrl,
            AuthenticationConstants.ToChannelFromBotOAuthScope,
            CallerIdConstants.PublicAzureChannel,
            authHeaderValidator,
            emulatorAuthValidator,
            emulatorSkillAuthValidator
        );
    }
}
