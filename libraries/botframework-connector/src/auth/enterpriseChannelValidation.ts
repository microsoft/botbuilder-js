/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { VerifyOptions } from 'jsonwebtoken';
import { AuthenticationConfiguration } from './authenticationConfiguration';
import { AuthenticationConstants } from './authenticationConstants';
import { ChannelValidation } from './channelValidation';
import { ClaimsIdentity } from './claimsIdentity';
import { ICredentialProvider } from './credentialProvider';
import { JwtTokenExtractor } from './jwtTokenExtractor';
import { AuthenticationError } from './authenticationError';
import { StatusCodes } from 'botframework-schema';

/**
 * @deprecated Use `ConfigurationBotFrameworkAuthentication` instead to perform enterprise channel validation.
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace EnterpriseChannelValidation {
    /**
     * TO BOT FROM CHANNEL: Token validation parameters when connecting to a bot
     */
    export const ToBotFromEnterpriseChannelTokenValidationParameters: VerifyOptions = {
        issuer: [AuthenticationConstants.ToBotFromChannelTokenIssuer],
        audience: undefined, // Audience validation takes place manually in code.
        clockTolerance: 5 * 60,
        ignoreExpiration: false,
    };

    /**
     * Validate the incoming Auth Header as a token sent from the Bot Framework Service.
     * A token issued by the Bot Framework emulator will FAIL this check.
     *
     * @param {string} authHeader The raw HTTP header in the format: "Bearer [longString]"
     * @param {ICredentialProvider} credentials The user defined set of valid credentials, such as the AppId.
     * @param {string} serviceUrl The ServiceUrl Claim value that must match in the identity.
     * @param channelId The ID of the channel to validate.
     * @param channelService The channelService value that distinguishes public Azure from US Government Azure.
     * @returns {Promise<ClaimsIdentity>} A valid ClaimsIdentity.
     */
    export async function authenticateChannelTokenWithServiceUrl(
        authHeader: string,
        credentials: ICredentialProvider,
        serviceUrl: string,
        channelId: string,
        channelService: string
    ): Promise<ClaimsIdentity> {
        const identity: ClaimsIdentity = await authenticateChannelToken(
            authHeader,
            credentials,
            channelId,
            channelService
        );

        const serviceUrlClaim: string = identity.getClaimValue(AuthenticationConstants.ServiceUrlClaim);
        if (serviceUrlClaim !== serviceUrl) {
            // Claim must match. Not Authorized.
            throw new AuthenticationError('Unauthorized. ServiceUrl claim do not match.', StatusCodes.UNAUTHORIZED);
        }

        return identity;
    }

    /**
     * Validate the incoming Auth Header as a token sent from the Bot Framework Service.
     * A token issued by the Bot Framework emulator will FAIL this check.
     *
     * @param {string} authHeader The raw HTTP header in the format: "Bearer [longString]"
     * @param {ICredentialProvider} credentials The user defined set of valid credentials, such as the AppId.
     * @param channelId The ID of the channel to validate.
     * @param channelService The channelService value that distinguishes public Azure from US Government Azure.
     * @param authConfig The authentication configuration.
     * @returns {Promise<ClaimsIdentity>} A valid ClaimsIdentity.
     */
    export async function authenticateChannelToken(
        authHeader: string,
        credentials: ICredentialProvider,
        channelId: string,
        channelService: string,
        authConfig: AuthenticationConfiguration = new AuthenticationConfiguration()
    ): Promise<ClaimsIdentity> {
        const tokenExtractor: JwtTokenExtractor = new JwtTokenExtractor(
            ToBotFromEnterpriseChannelTokenValidationParameters,
            ChannelValidation.OpenIdMetadataEndpoint
                ? ChannelValidation.OpenIdMetadataEndpoint
                : AuthenticationConstants.ToBotFromEnterpriseChannelOpenIdMetadataUrlFormat.replace(
                      '{channelService}',
                      channelService
                  ),
            AuthenticationConstants.AllowedSigningAlgorithms
        );

        const identity: ClaimsIdentity = await tokenExtractor.getIdentityFromAuthHeader(
            authHeader,
            channelId,
            authConfig.requiredEndorsements
        );

        return await validateIdentity(identity, credentials);
    }

    /**
     * Validate the ClaimsIdentity to ensure it came from the channel service.
     *
     * @param  {ClaimsIdentity} identity The identity to validate
     * @param  {ICredentialProvider} credentials The user defined set of valid credentials, such as the AppId.
     * @returns {Promise<ClaimsIdentity>} A valid ClaimsIdentity.
     */
    export async function validateIdentity(
        identity: ClaimsIdentity,
        credentials: ICredentialProvider
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
            AuthenticationConstants.ToBotFromChannelTokenIssuer
        ) {
            // The relevant Audiance Claim MUST be present. Not Authorized.
            throw new AuthenticationError('Unauthorized. Issuer Claim MUST be present.', StatusCodes.UNAUTHORIZED);
        }

        // The AppId from the claim in the token must match the AppId specified by the developer.
        // In this case, the token is destined for the app, so we find the app ID in the audience claim.
        const audClaim: string = identity.getClaimValue(AuthenticationConstants.AudienceClaim);
        if (!(await credentials.isValidAppId(audClaim || ''))) {
            // The AppId is not valid or not present. Not Authorized.
            throw new AuthenticationError(
                `Unauthorized. Invalid AppId passed on token: ${audClaim}`,
                StatusCodes.UNAUTHORIZED
            );
        }

        return identity;
    }
}
