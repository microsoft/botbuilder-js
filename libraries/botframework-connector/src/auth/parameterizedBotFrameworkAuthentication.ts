// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Activity } from 'botframework-schema';
import { AuthValidator } from './authValidator';
import { AuthenticationConfiguration } from './authenticationConfiguration';
import { ClaimsIdentity } from './claimsIdentity';
import { DelegatingCredentialProvider, ICredentialProvider } from './credentialProvider';
import { EmulatorValidation } from './emulatorValidation';
import { JwtTokenValidation } from './jwtTokenValidation';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { SkillValidation } from './skillValidation';

import {
    AuthenticateRequestResult,
    BotFrameworkAuthentication,
    ProactiveCredentialsResult,
} from './botFrameworkAuthentication';

// Create a fully parameterized BotFrameworkAuthentication instance. Useful for scenarios
// like tests or other non-standard deployments.
export class ParameterizedBotFrameworkAuthentication extends BotFrameworkAuthentication {
    private readonly credentials: ICredentialProvider;

    /**
     * Construct a ParameterizedBotFrameworkAuthentication instance
     *
     * @param {ServiceClientCredentialsFactory} credentialFactory the credential factory to use
     * @param {AuthenticationConfiguration} authConfiguration the auth configuration to use
     * @param {boolean} validateAuthority whether or not validate the authority
     * @param {string} toChannelFromBotLoginUrl login url for messages from bot to channel
     * @param {string} toChannelFromBotOAuthScope oauth scope for messages from bot to channel
     * @param {string} callerId caller ID
     * @param {AuthValidator} authValidator general auth validator
     * @param {AuthValidator} emulatorAuthValidator emulator auth validator
     * @param {AuthValidator} skillAuthValidator skill auth validator
     */
    constructor(
        private readonly credentialFactory: ServiceClientCredentialsFactory,
        private readonly authConfiguration: AuthenticationConfiguration,
        private readonly validateAuthority: boolean,
        private readonly toChannelFromBotLoginUrl: string,
        private readonly toChannelFromBotOAuthScope: string,
        private readonly callerId: string | undefined,
        private readonly authValidator: AuthValidator,
        private readonly emulatorAuthValidator: AuthValidator,
        private readonly skillAuthValidator: AuthValidator
    ) {
        super();
        this.credentials = new DelegatingCredentialProvider(credentialFactory);
    }

    private async getClaimsIdentity(activity: Partial<Activity>, authHeader: string): Promise<ClaimsIdentity> {
        let authValidator = this.authValidator;

        if (SkillValidation.isSkillToken(authHeader)) {
            authValidator = this.skillAuthValidator;
        } else if (EmulatorValidation.isTokenFromEmulator(authHeader)) {
            authValidator = this.emulatorAuthValidator;
        }

        return authValidator(this.credentials, this.authConfiguration, authHeader, activity);
    }

    async authenticateRequest(activity: Partial<Activity>, authHeader: string): Promise<AuthenticateRequestResult> {
        const claimsIdentity = await this.getClaimsIdentity(activity, authHeader.trim());

        const scope = SkillValidation.isSkillClaim(claimsIdentity.claims)
            ? JwtTokenValidation.getAppIdFromClaims(claimsIdentity.claims)
            : this.toChannelFromBotOAuthScope;

        const callerId = await this.generateCallerId(this.credentialFactory, claimsIdentity, this.callerId);

        const appId = this.getAppId(claimsIdentity);

        const credentials = await this.credentialFactory.createCredentials(
            appId,
            scope,
            this.toChannelFromBotLoginUrl,
            this.validateAuthority
        );

        return { callerId, claimsIdentity, credentials, scope };
    }

    async getProactiveCredentials(
        claimsIdentity: ClaimsIdentity,
        audience: string
    ): Promise<ProactiveCredentialsResult> {
        const scope = audience ?? this.toChannelFromBotOAuthScope;

        const appId = this.getAppId(claimsIdentity);

        const credentials = await this.credentialFactory.createCredentials(
            appId,
            scope,
            this.toChannelFromBotLoginUrl,
            true
        );

        return { credentials, scope };
    }
}
