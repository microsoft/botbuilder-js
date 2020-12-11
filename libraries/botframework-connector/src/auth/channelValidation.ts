/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable @typescript-eslint/no-namespace */

import { AuthValidator, IdentityValidator, makeAuthValidator } from './authValidator';
import { AuthenticationConfiguration } from './authenticationConfiguration';
import { AuthenticationConstants } from './authenticationConstants';
import { AuthenticationError } from './authenticationError';
import { ClaimsIdentity } from './claimsIdentity';
import { ICredentialProvider } from './credentialProvider';
import { StatusCodes } from 'botframework-schema';
import { VerifyOptions } from 'jsonwebtoken';

const validateClaimsIdentity: IdentityValidator = async (credentials, identity) => {
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
};

/**
 * Construct a channel auth validator using a specific open ID metadata url
 *
 * @param {string} openIdMetadataUrl url to fetch open ID metadata
 * @returns {AuthValidator} a channel auth validator
 */
export function makeChannelAuthValidator(openIdMetadataUrl: string): AuthValidator {
    return makeAuthValidator(
        ChannelValidation.ToBotFromChannelTokenValidationParameters,
        openIdMetadataUrl,
        validateClaimsIdentity
    );
}

export namespace ChannelValidation {
    export let OpenIdMetadataEndpoint: string;

    /**
     * TO BOT FROM CHANNEL: Token validation parameters when connecting to a bot
     */
    export const ToBotFromChannelTokenValidationParameters: VerifyOptions = {
        issuer: [AuthenticationConstants.ToBotFromChannelTokenIssuer],
        audience: undefined, // Audience validation takes place manually in code.
        clockTolerance: 5 * 60,
        ignoreExpiration: false,
    };

    /**
     * Validate the incoming Auth Header as a token sent from the Bot Framework Service.
     * A token issued by the Bot Framework emulator will FAIL this check.
     * @param  {string} authHeader The raw HTTP header in the format: "Bearer [longString]"
     * @param  {ICredentialProvider} credentials The user defined set of valid credentials, such as the AppId.
     * @param  {string} serviceUrl The ServiceUrl Claim value that must match in the identity.
     * @param  {string} channelId
     * @param  {AuthenticationConfiguration} authConfig
     * @returns {Promise<ClaimsIdentity>} A valid ClaimsIdentity.
     */
    export async function authenticateChannelTokenWithServiceUrl(
        authHeader: string,
        credentials: ICredentialProvider,
        serviceUrl: string,
        channelId: string,
        authConfig: AuthenticationConfiguration = new AuthenticationConfiguration()
    ): Promise<ClaimsIdentity> {
        const identity: ClaimsIdentity = await authenticateChannelToken(authHeader, credentials, channelId, authConfig);

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
     * @param  {string} authHeader The raw HTTP header in the format: "Bearer [longString]"
     * @param  {ICredentialProvider} credentials The user defined set of valid credentials, such as the AppId.
     * @param  {string} channelId
     * @param  {AuthenticationConfiguration} authConfig
     * @returns {Promise<ClaimsIdentity>} A valid ClaimsIdentity.
     */
    export async function authenticateChannelToken(
        authHeader: string,
        credentials: ICredentialProvider,
        channelId: string,
        authConfig: AuthenticationConfiguration = new AuthenticationConfiguration()
    ): Promise<ClaimsIdentity> {
        const validateAuth = makeChannelAuthValidator(
            OpenIdMetadataEndpoint ?? AuthenticationConstants.ToBotFromChannelOpenIdMetadataUrl
        );

        return validateAuth(credentials, authConfig, authHeader, { channelId });
    }

    /**
     * Validate the ClaimsIdentity to ensure it came from the channel service.
     * @param  {ClaimsIdentity} identity The identity to validate
     * @param  {ICredentialProvider} credentials The user defined set of valid credentials, such as the AppId.
     * @returns {Promise<ClaimsIdentity>} A valid ClaimsIdentity.
     */
    export async function validateIdentity(
        identity: ClaimsIdentity,
        credentials: ICredentialProvider
    ): Promise<ClaimsIdentity> {
        if (!identity || !identity.isAuthenticated) {
            // The token is in some way invalid. Not Authorized.
            throw new AuthenticationError('Unauthorized. Is not authenticated', StatusCodes.UNAUTHORIZED);
        }

        await validateClaimsIdentity(credentials, identity, {});

        return identity;
    }
}
