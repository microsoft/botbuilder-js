// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ConnectorFactory } from '../connectorFactory';
import { BotFrameworkClient } from '../skills';
import { AuthenticateRequestResult } from './authenticateRequestResult';
import { AuthenticationConfiguration } from './authenticationConfiguration';
import { AuthenticationError } from './authenticationError';
import { BotFrameworkAuthentication } from './botFrameworkAuthentication';
import { BotFrameworkClientImpl } from './botFrameworkClientImpl';
import { Claim, ClaimsIdentity } from './claimsIdentity';
import { JwtTokenValidation } from './jwtTokenValidation';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { SkillValidation } from './skillValidation';
import { Activity, Channels, RoleTypes, StatusCodes } from 'botframework-schema';
import { AuthenticationConstants } from './authenticationConstants';
import { GovernmentConstants } from './governmentConstants';
import { JwtTokenExtractor } from './jwtTokenExtractor';
import { VerifyOptions } from 'jsonwebtoken';
import { EmulatorValidation } from './emulatorValidation';
import { ConnectorClientOptions } from '../connectorApi/models';
import { ConnectorFactoryImpl } from './connectorFactoryImpl';
import { UserTokenClientImpl } from './userTokenClientImpl';
import { UserTokenClient } from './userTokenClient';

// Clean up tokenValidationParameters

// Internal
export class ParameterizedBotFrameworkAuthentication extends BotFrameworkAuthentication {
    private static SkillAndEmulatorTokenValidationParameters: VerifyOptions = {
        issuer: [
            'https://sts.windows.net/d6d49420-f39b-4df7-a1dc-d59a935871db/', // Auth v3.1, 1.0 token
            'https://login.microsoftonline.com/d6d49420-f39b-4df7-a1dc-d59a935871db/v2.0', // Auth v3.1, 2.0 token
            'https://sts.windows.net/f8cdef31-a31e-4b4a-93e4-5f571e91255a/', // Auth v3.2, 1.0 token
            'https://login.microsoftonline.com/f8cdef31-a31e-4b4a-93e4-5f571e91255a/v2.0', // Auth v3.2, 2.0 token
            'https://sts.windows.net/72f988bf-86f1-41af-91ab-2d7cd011db47/', // ???
            'https://sts.windows.net/cab8a31a-1906-4287-a0d8-4eef66b95f6e/', // US Gov Auth, 1.0 token
            'https://login.microsoftonline.us/cab8a31a-1906-4287-a0d8-4eef66b95f6e/v2.0', // US Gov Auth, 2.0 token
            'https://login.microsoftonline.us/f8cdef31-a31e-4b4a-93e4-5f571e91255a/', // Auth for US Gov, 1.0 token
            'https://login.microsoftonline.us/f8cdef31-a31e-4b4a-93e4-5f571e91255a/v2.0', // Auth for US Gov, 2.0 token
        ],
        audience: undefined, // Audience validation takes place manually in code.
        clockTolerance: 5 * 60,
        ignoreExpiration: false,
    };

    constructor(
        private readonly validateAuthority: boolean,
        private readonly toChannelFromBotLoginUrl: string,
        private readonly toChannelFromBotOAuthScope: string,
        private readonly toBotFromChannelTokenIssuer: string,
        private readonly oAuthUrl: string,
        private readonly toBotFromChannelOpenIdMetadataUrl: string,
        private readonly toBotFromEmulatorOpenIdMetadataUrl: string,
        private readonly callerId: string,
        private readonly credentialsFactory: ServiceClientCredentialsFactory,
        private readonly authConfiguration: AuthenticationConfiguration,
        private readonly botFrameworkClientFetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
        private readonly connectorClientOptions: ConnectorClientOptions = {},
    ) {
        super();
    }

    getOriginatingAudience(): string {
        return this.toChannelFromBotOAuthScope;
    }

    async authenticateChannelRequest(authHeader: string): Promise<ClaimsIdentity> {
        return this.JwtTokenValidation_validateAuthHeader(authHeader, 'unknown', null);
    }

    async authenticateRequest(activity: Activity, authHeader: string): Promise<AuthenticateRequestResult> {
        const claimsIdentity = await this.JwtTokenValidation_authenticateRequest(activity, authHeader);

        const outboundAudience = SkillValidation.isSkillClaim(claimsIdentity.claims) ? JwtTokenValidation.getAppIdFromClaims(claimsIdentity.claims) : this.toChannelFromBotOAuthScope;

        const callerId = await this.generateCallerId(this.credentialsFactory, claimsIdentity, this.callerId);

        var connectorFactory = new ConnectorFactoryImpl(
            ParameterizedBotFrameworkAuthentication.getAppId(claimsIdentity),
            this.toChannelFromBotOAuthScope,
            this.toChannelFromBotLoginUrl,
            this.validateAuthority,
            this.credentialsFactory
        );

        return { audience: outboundAudience, callerId, claimsIdentity, connectorFactory };
    }

    async authenticateStreamingRequest(authHeader: string, channelIdHeader: string): Promise<AuthenticateRequestResult> {
        if ((typeof channelIdHeader !== 'string' || channelIdHeader.trim() === '') && !await this.credentialsFactory.isAuthenticationDisabled()) {
            throw new AuthenticationError("'authHeader' required.", StatusCodes.BAD_REQUEST);
        }

        const claimsIdentity = await this.JwtTokenValidation_validateAuthHeader(authHeader, channelIdHeader, null);
        const outboundAudience = SkillValidation.isSkillClaim(claimsIdentity.claims)
            ? JwtTokenValidation.getAppIdFromClaims(claimsIdentity.claims)
            : this.toChannelFromBotOAuthScope;
        const callerId = await this.generateCallerId(this.credentialsFactory, claimsIdentity, this.callerId);

        return { audience: outboundAudience, callerId, claimsIdentity };
    }

    async createUserTokenClient(claimsIdentity: ClaimsIdentity): Promise<UserTokenClient> {
        const appId = ParameterizedBotFrameworkAuthentication.getAppId(claimsIdentity);
        const credentials = await this.credentialsFactory.createCredentials(
            appId,
            this.toChannelFromBotOAuthScope,
            this.toChannelFromBotLoginUrl,
            this.validateAuthority
        );

        return new UserTokenClientImpl(
            appId,
            credentials,
            this.oAuthUrl,
            this.connectorClientOptions
        )
    }

    createConnectorFactory(claimsIdentity: ClaimsIdentity): ConnectorFactory {
        return new ConnectorFactoryImpl(
            ParameterizedBotFrameworkAuthentication.getAppId(claimsIdentity),
            this.toChannelFromBotOAuthScope,
            this.toChannelFromBotLoginUrl,
            this.validateAuthority,
            this.credentialsFactory
        );
    }

    createBotFrameworkClient(): BotFrameworkClient {
        return new BotFrameworkClientImpl(
            this.credentialsFactory,
            this.toChannelFromBotLoginUrl,
            this.botFrameworkClientFetch
        );
    }

    static getAppId(claimsIdentity: ClaimsIdentity): string | null {
        // For requests from channel App Id is in Audience claim of JWT token. For emulator it is in AppId claim. For
        // unauthenticated requests we have anonymous claimsIdentity provided auth is disabled.
        // For Activities coming from Emulator AppId claim contains the Bot's AAD AppId.
        return claimsIdentity.getClaimValue(AuthenticationConstants.AudienceClaim)
            ?? claimsIdentity.getClaimValue(AuthenticationConstants.AppIdClaim);
    }

    private async JwtTokenValidation_authenticateRequest(
        activity: Partial<Activity>,
        authHeader: string,
    ): Promise<ClaimsIdentity> {
        if (!authHeader.trim()) {
            const isAuthDisabled = await this.credentialsFactory.isAuthenticationDisabled();
            if (!isAuthDisabled) {
                throw new AuthenticationError(
                    'Unauthorized Access. Request is not authorized',
                    StatusCodes.UNAUTHORIZED
                );
            }

            // Check if the activity is for a skill call and is coming from the Emulator.
            if (
                activity.channelId === Channels.Emulator &&
                activity.recipient &&
                activity.recipient.role === RoleTypes.Skill
            ) {
                return SkillValidation.createAnonymousSkillClaim();
            }

            // In the scenario where Auth is disabled, we still want to have the
            // IsAuthenticated flag set in the ClaimsIdentity. To do this requires
            // adding in an empty claim.
            return new ClaimsIdentity([], AuthenticationConstants.AnonymousAuthType);
        }

        const claimsIdentity: ClaimsIdentity = await this.JwtTokenValidation_validateAuthHeader(
            authHeader,
            activity.channelId,
            activity.serviceUrl,
        );

        return claimsIdentity;
    }

    private async JwtTokenValidation_validateAuthHeader(
        authHeader: string,
        channelId: string,
        serviceUrl = '',
    ): Promise<ClaimsIdentity> {
        if (!authHeader.trim()) {
            throw new AuthenticationError("'authHeader' required.", StatusCodes.BAD_REQUEST);
        }

        const identity = await this.JwtTokenValidation_authenticateToken(
            authHeader,
            channelId,
            serviceUrl
        );

        await this.JwtTokenValidation_validateClaims(identity.claims);

        return identity;
    }

    private async JwtTokenValidation_validateClaims(claims: Claim[] = []): Promise<void> {
        if (this.authConfiguration.validateClaims) {
            // Call the validation method if defined (it should throw an exception if the validation fails)
            await this.authConfiguration.validateClaims(claims);
        } else if (SkillValidation.isSkillClaim(claims)) {
            // Skill claims must be validated using AuthenticationConfiguration validateClaims
            throw new AuthenticationError(
                'Unauthorized Access. Request is not authorized. Skill Claims require validation.',
                StatusCodes.UNAUTHORIZED
            );
        }
    }

    private async JwtTokenValidation_authenticateToken(
        authHeader: string,
        channelId: string,
        serviceUrl: string
    ): Promise<ClaimsIdentity | undefined> {
        if (SkillValidation.isSkillToken(authHeader)) {
            return this.SkillValidation_authenticateChannelToken(authHeader, channelId);
        }

        if (EmulatorValidation.isTokenFromEmulator(authHeader)) {
            return this.EmulatorValidation_authenticateEmulatorToken(authHeader, channelId);
        }

        // Handle requests from BotFramework Channels
        return this.ChannelValidation_authenticateChannelToken(authHeader, serviceUrl, channelId);
    }

    private async SkillValidation_authenticateChannelToken(
        authHeader: string,
        channelId: string,
    ): Promise<ClaimsIdentity> {
        const tokenExtractor = new JwtTokenExtractor(
            ParameterizedBotFrameworkAuthentication.SkillAndEmulatorTokenValidationParameters,
            this.toBotFromEmulatorOpenIdMetadataUrl,
            AuthenticationConstants.AllowedSigningAlgorithms
        );

        const parts: string[] = authHeader.split(' ');
        const identity = await tokenExtractor.getIdentity(
            parts[0],
            parts[1],
            channelId,
            this.authConfiguration.requiredEndorsements
        );

        await this.SkillValidation_ValidateIdentity(identity);

        return identity;
    }

    private async SkillValidation_ValidateIdentity(identity: ClaimsIdentity): Promise<void> {
        if (!identity) {
            // No valid identity. Not Authorized.
            throw new AuthenticationError(
                'SkillValidation.validateIdentity(): Invalid identity',
                StatusCodes.UNAUTHORIZED
            );
        }

        if (!identity.isAuthenticated) {
            // The token is in some way invalid. Not Authorized.
            throw new AuthenticationError(
                'SkillValidation.validateIdentity(): Token not authenticated',
                StatusCodes.UNAUTHORIZED
            );
        }

        const versionClaim = identity.getClaimValue(AuthenticationConstants.VersionClaim);
        if (!versionClaim) {
            // No version claim
            throw new AuthenticationError(
                `SkillValidation.validateIdentity(): '${AuthenticationConstants.VersionClaim}' claim is required on skill Tokens.`,
                StatusCodes.UNAUTHORIZED
            );
        }

        // Look for the "aud" claim, but only if issued from the Bot Framework
        const audienceClaim = identity.getClaimValue(AuthenticationConstants.AudienceClaim);
        if (!audienceClaim) {
            // Claim is not present or doesn't have a value. Not Authorized.
            throw new AuthenticationError(
                `SkillValidation.validateIdentity(): '${AuthenticationConstants.AudienceClaim}' claim is required on skill Tokens.`,
                StatusCodes.UNAUTHORIZED
            );
        }

        if (!(await this.credentialsFactory.isValidAppId(audienceClaim))) {
            // The AppId is not valid. Not Authorized.
            throw new AuthenticationError(
                'SkillValidation.validateIdentity(): Invalid audience.',
                StatusCodes.UNAUTHORIZED
            );
        }

        const appId = JwtTokenValidation.getAppIdFromClaims(identity.claims);
        if (!appId) {
            // Invalid appId
            throw new AuthenticationError(
                'SkillValidation.validateIdentity(): Invalid appId.',
                StatusCodes.UNAUTHORIZED
            );
        }
    }

    private async EmulatorValidation_authenticateEmulatorToken(
        authHeader: string,
        channelId: string,
    ): Promise<ClaimsIdentity> {
        const tokenExtractor: JwtTokenExtractor = new JwtTokenExtractor(
            ParameterizedBotFrameworkAuthentication.SkillAndEmulatorTokenValidationParameters,
            this.toBotFromEmulatorOpenIdMetadataUrl,
            AuthenticationConstants.AllowedSigningAlgorithms
        );

        const identity: ClaimsIdentity = await tokenExtractor.getIdentityFromAuthHeader(
            authHeader,
            channelId,
            this.authConfiguration.requiredEndorsements
        );
        if (!identity) {
            // No valid identity. Not Authorized.
            throw new AuthenticationError('Unauthorized. No valid identity.', StatusCodes.UNAUTHORIZED);
        }

        if (!identity.isAuthenticated) {
            // The token is in some way invalid. Not Authorized.
            throw new AuthenticationError('Unauthorized. Is not authenticated', StatusCodes.UNAUTHORIZED);
        }

        // Now check that the AppID in the claimset matches
        // what we're looking for. Note that in a multi-tenant bot, this value
        // comes from developer code that may be reaching out to a service, hence the
        // Async validation.
        const versionClaim: string = identity.getClaimValue(AuthenticationConstants.VersionClaim);
        if (versionClaim === null) {
            throw new AuthenticationError(
                'Unauthorized. "ver" claim is required on Emulator Tokens.',
                StatusCodes.UNAUTHORIZED
            );
        }

        let appId = '';

        // The Emulator, depending on Version, sends the AppId via either the
        // appid claim (Version 1) or the Authorized Party claim (Version 2).
        if (!versionClaim || versionClaim === '1.0') {
            // either no Version or a version of "1.0" means we should look for
            // the claim in the "appid" claim.
            const appIdClaim: string = identity.getClaimValue(AuthenticationConstants.AppIdClaim);
            if (!appIdClaim) {
                // No claim around AppID. Not Authorized.
                throw new AuthenticationError(
                    'Unauthorized. "appid" claim is required on Emulator Token version "1.0".',
                    StatusCodes.UNAUTHORIZED
                );
            }

            appId = appIdClaim;
        } else if (versionClaim === '2.0') {
            // Emulator, "2.0" puts the AppId in the "azp" claim.
            const appZClaim: string = identity.getClaimValue(AuthenticationConstants.AuthorizedParty);
            if (!appZClaim) {
                // No claim around AppID. Not Authorized.
                throw new AuthenticationError(
                    'Unauthorized. "azp" claim is required on Emulator Token version "2.0".',
                    StatusCodes.UNAUTHORIZED
                );
            }

            appId = appZClaim;
        } else {
            // Unknown Version. Not Authorized.
            throw new AuthenticationError(
                `Unauthorized. Unknown Emulator Token version "${versionClaim}".`,
                StatusCodes.UNAUTHORIZED
            );
        }

        if (!(await this.credentialsFactory.isValidAppId(appId))) {
            throw new AuthenticationError(
                `Unauthorized. Invalid AppId passed on token: ${appId}`,
                StatusCodes.UNAUTHORIZED
            );
        }

        return identity;   
    }

    private async ChannelValidation_authenticateChannelToken(
        authHeader: string,
        serviceUrl: string,
        channelId: string
    ): Promise<ClaimsIdentity> {
        const tokenValidationParameters = this.ChannelValidation_GetTokenValidationParameters();
        const tokenExtractor: JwtTokenExtractor = new JwtTokenExtractor(
            tokenValidationParameters,
            this.toBotFromChannelOpenIdMetadataUrl,
            AuthenticationConstants.AllowedSigningAlgorithms
        );

        const identity: ClaimsIdentity = await tokenExtractor.getIdentityFromAuthHeader(
            authHeader,
            channelId,
            this.authConfiguration.requiredEndorsements
        );

        return this.governmentChannelValidation_ValidateIdentity(identity, serviceUrl);
    }
    
    private ChannelValidation_GetTokenValidationParameters(): VerifyOptions {
        return {
            issuer: [this.toBotFromChannelTokenIssuer],
            audience: undefined, // Audience validation takes place manually in code.
            clockTolerance: 5 * 60,
            ignoreExpiration: false,
        };

    }

    private async governmentChannelValidation_ValidateIdentity(
        identity: ClaimsIdentity,
        serviceUrl: string
    ): Promise<ClaimsIdentity> {
        if (!identity) {
            // No valid identity. Not Authorized.
            throw new AuthenticationError('Unauthorized. No valid identity.', StatusCodes.UNAUTHORIZED);
        }

        if (!identity.isAuthenticated) {
            // The token is in some way invalid. Not Authorized.
            throw new AuthenticationError('Unauthorized. Is not authenticated', StatusCodes.UNAUTHORIZED);
        }

        // Now check that the AppID in the claimset matches
        // what we're looking for. Note that in a multi-tenant bot, this value
        // comes from developer code that may be reaching out to a service, hence the
        // Async validation.

        // Look for the "aud" claim, but only if issued from the Bot Framework
        if (
            identity.getClaimValue(AuthenticationConstants.IssuerClaim) !==
            GovernmentConstants.ToBotFromChannelTokenIssuer
        ) {
            // The relevant Audiance Claim MUST be present. Not Authorized.
            throw new AuthenticationError('Unauthorized. Issuer Claim MUST be present.', StatusCodes.UNAUTHORIZED);
        }

        // The AppId from the claim in the token must match the AppId specified by the developer.
        // In this case, the token is destined for the app, so we find the app ID in the audience claim.
        const audClaim: string = identity.getClaimValue(AuthenticationConstants.AudienceClaim);
        if (!(await this.credentialsFactory.isValidAppId(audClaim || ''))) {
            // The AppId is not valid or not present. Not Authorized.
            throw new AuthenticationError(
                `Unauthorized. Invalid AppId passed on token: ${audClaim}`,
                StatusCodes.UNAUTHORIZED
            );
        }

        if (serviceUrl) {
            const serviceUrlClaim = identity.getClaimValue(AuthenticationConstants.ServiceUrlClaim);
            if (serviceUrlClaim !== serviceUrl) {
                // Claim must match. Not Authorized.
                throw new AuthenticationError('Unauthorized. ServiceUrl claim do not match.', StatusCodes.UNAUTHORIZED);
            }
        }

        return identity;
    }
}
