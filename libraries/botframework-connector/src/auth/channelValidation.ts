/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { VerifyOptions } from 'jsonwebtoken';
import { Constants } from './constants';
import { ICredentialProvider } from './credentialProvider';
import { ClaimsIdentity } from './claimsIdentity';
import { JwtTokenExtractor } from './jwtTokenExtractor';

export module ChannelValidation {

    /**
     * TO BOT FROM CHANNEL: Token validation parameters when connecting to a bot
     */
    export const ToBotFromChannelTokenValidationParameters: VerifyOptions = {
        issuer: [Constants.ToBotFromChannelTokenIssuer],
        audience: undefined,                                 // Audience validation takes place manually in code.
        clockTolerance: 5 * 60,
        ignoreExpiration: false
    };

    /**
     * Validate the incoming Auth Header as a token sent from the Bot Framework Service.
     * A token issued by the Bot Framework emulator will FAIL this check.
     * @param  {string} authHeader The raw HTTP header in the format: "Bearer [longString]"
     * @param  {ICredentialProvider} credentials The user defined set of valid credentials, such as the AppId.
     * @param  {string} serviceUrl The ServiceUrl Claim value that must match in the identity.
     * @returns {Promise<ClaimsIdentity>} A valid ClaimsIdentity.
     */
    export async function authenticateChannelTokenWithServiceUrl(authHeader: string, credentials: ICredentialProvider, serviceUrl: string): Promise<ClaimsIdentity> {

        let identity = await authenticateChannelToken(authHeader, credentials);

        let serviceUrlClaim = identity.getClaimValue(Constants.ServiceUrlClaim);
        if (serviceUrlClaim !== serviceUrl) {
            // Claim must match. Not Authorized.
            throw new Error('Unauthorized. ServiceUrl claim do not match.');
        }

        return identity;
    }

    /**
     * Validate the incoming Auth Header as a token sent from the Bot Framework Service.
     * A token issued by the Bot Framework emulator will FAIL this check.
     * @param  {string} authHeader The raw HTTP header in the format: "Bearer [longString]"
     * @param  {ICredentialProvider} credentials The user defined set of valid credentials, such as the AppId.
     * @returns {Promise<ClaimsIdentity>} A valid ClaimsIdentity.
     */
    export async function authenticateChannelToken(authHeader: string, credentials: ICredentialProvider): Promise<ClaimsIdentity> {

        let tokenExtractor = new JwtTokenExtractor(
            ToBotFromChannelTokenValidationParameters,
            Constants.ToBotFromChannelOpenIdMetadataUrl,
            Constants.AllowedSigningAlgorithms);

        let identity = await tokenExtractor.getIdentityFromAuthHeader(authHeader);
        if (!identity) {
            // No valid identity. Not Authorized.
            throw new Error('Unauthorized. No valid identity.');
        }

        if (!identity.isAuthenticated) {
            // The token is in some way invalid. Not Authorized.
            throw new Error('Unauthorized. Is not authenticated');
        }

        // Now check that the AppID in the claimset matches
        // what we're looking for. Note that in a multi-tenant bot, this value
        // comes from developer code that may be reaching out to a service, hence the
        // Async validation.

        // Look for the "aud" claim, but only if issued from the Bot Framework
        if (identity.getClaimValue(Constants.IssuerClaim) !== Constants.ToBotFromChannelTokenIssuer) {
            // The relevant Audiance Claim MUST be present. Not Authorized.
            throw new Error('Unauthorized. Audiance Claim MUST be present.');
        }

        // The AppId from the claim in the token must match the AppId specified by the developer. 
        // In this case, the token is destined for the app, so we find the app ID in the audience claim.
        let audClaim = identity.getClaimValue(Constants.AudienceClaim);
        if (!(await credentials.isValidAppId(audClaim || ""))) {
            // The AppId is not valid or not present. Not Authorized.
            throw new Error(`Unauthorized. Invalid AppId passed on token: ${audClaim}`)
        }

        return identity;
    }
}