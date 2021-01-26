/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable @typescript-eslint/no-namespace */

import { Activity, StatusCodes } from 'botframework-schema';
import { AuthHeaderValidator } from './authHeaderValidator';
import { AuthenticationConfiguration } from './authenticationConfiguration';
import { AuthenticationConstants } from './authenticationConstants';
import { AuthenticationError } from './authenticationError';
import { ClaimsIdentity } from './claimsIdentity';
import { ClaimsIdentityValidator } from './claimsIdentityValidator';
import { GovernmentConstants } from './governmentConstants';
import { ICredentialProvider } from './credentialProvider';
import { JwtTokenExtractor } from './jwtTokenExtractor';
import { VerifyOptions } from 'jsonwebtoken';

class GovernmentClaimsIdentityValidator implements ClaimsIdentityValidator {
    async validate(
        credentials: ICredentialProvider,
        claimsIdentity: ClaimsIdentity,
        _activity: Partial<Activity>
    ): Promise<void> {
        // Now check that the AppID in the claimset matches
        // what we're looking for. Note that in a multi-tenant bot, this value
        // comes from developer code that may be reaching out to a service, hence the
        // Async validation.

        // Look for the "aud" claim, but only if issued from the Bot Framework
        if (
            claimsIdentity.getClaimValue(AuthenticationConstants.IssuerClaim) !==
            GovernmentConstants.ToBotFromChannelTokenIssuer
        ) {
            // The relevant Audiance Claim MUST be present. Not Authorized.
            throw new AuthenticationError('Unauthorized. Issuer Claim MUST be present.', StatusCodes.UNAUTHORIZED);
        }

        // The AppId from the claim in the token must match the AppId specified by the developer.
        // In this case, the token is destined for the app, so we find the app ID in the audience claim.
        const audClaim: string = claimsIdentity.getClaimValue(AuthenticationConstants.AudienceClaim);
        if (!(await credentials.isValidAppId(audClaim || ''))) {
            // The AppId is not valid or not present. Not Authorized.
            throw new AuthenticationError(
                `Unauthorized. Invalid AppId passed on token: ${audClaim}`,
                StatusCodes.UNAUTHORIZED
            );
        }
    }
}

/**
 * Construct an emulator auth validator using a specific open ID metadata url
 *
 * @param {string} openIdMetadataUrl url to fetch open ID metadata
 * @param {VerifyOptions} verifyOverrides verify options overrides
 * @returns {AuthHeaderValidator} an emulator auth validator
 */
export function makeGovernmentAuthValidator(
    openIdMetadataUrl: string,
    verifyOverrides?: VerifyOptions
): AuthHeaderValidator {
    return new AuthHeaderValidator(
        Object.assign(
            {},
            GovernmentChannelValidation.ToBotFromGovernmentChannelTokenValidationParameters,
            verifyOverrides
        ),
        openIdMetadataUrl,
        new GovernmentClaimsIdentityValidator()
    );
}

export namespace GovernmentChannelValidation {
    export let OpenIdMetadataEndpoint: string;

    /**
     * TO BOT FROM GOVERNMENT CHANNEL: Token validation parameters when connecting to a bot
     */
    export const ToBotFromGovernmentChannelTokenValidationParameters: VerifyOptions = {
        issuer: [GovernmentConstants.ToBotFromChannelTokenIssuer],
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
     * @returns {Promise<ClaimsIdentity>} A valid ClaimsIdentity.
     */
    export async function authenticateChannelTokenWithServiceUrl(
        authHeader: string,
        credentials: ICredentialProvider,
        serviceUrl: string,
        channelId: string
    ): Promise<ClaimsIdentity> {
        const identity: ClaimsIdentity = await authenticateChannelToken(authHeader, credentials, channelId);

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
        const validator = makeGovernmentAuthValidator(
            OpenIdMetadataEndpoint ? OpenIdMetadataEndpoint : GovernmentConstants.ToBotFromChannelOpenIdMetadataUrl
        );

        return validator.validate(credentials, authConfig, authHeader, { channelId });
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

        const validator = new GovernmentClaimsIdentityValidator();
        await validator.validate(credentials, identity, {});

        return identity;
    }
}
