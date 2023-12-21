/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable @typescript-eslint/no-namespace */

import { ClaimsIdentity } from './claimsIdentity';
import { AuthenticationConstants } from './authenticationConstants';
import { AuthenticationConfiguration } from './authenticationConfiguration';
import { GovernmentConstants } from './governmentConstants';
import { ICredentialProvider } from './credentialProvider';
import { JwtTokenExtractor } from './jwtTokenExtractor';
import { JwtTokenValidation } from './jwtTokenValidation';
import { AuthenticationError } from './authenticationError';
import { SimpleCredentialProvider } from './credentialProvider';
import { StatusCodes } from 'botframework-schema';
import { BetweenBotAndAseChannelTokenValidationParameters } from './tokenValidationParameters';

/**
 * @deprecated Use `ConfigurationBotFrameworkAuthentication` instead to perform AseChannel validation.
 * Validates and Examines JWT tokens from the Bot Framework AseChannel
 */
export namespace AseChannelValidation {
    const ChannelId = 'AseChannel';
    let _creadentialProvider: ICredentialProvider;
    let _channelService: string;
    export let MetadataUrl: string;

    /**
     * init authentication from user .env configuration.
     *
     * @param configuration The user .env configuration.
     */
    export function init(configuration: any) {
        const appId = configuration.MicrosoftAppId;
        const tenantId = configuration.MicrosoftAppTenantId;
        _channelService = configuration.ChannelService;
        MetadataUrl =
            _channelService !== undefined && JwtTokenValidation.isGovernment(_channelService)
                ? GovernmentConstants.ToBotFromEmulatorOpenIdMetadataUrl
                : AuthenticationConstants.ToBotFromEmulatorOpenIdMetadataUrl;

        _creadentialProvider = new SimpleCredentialProvider(appId, '');

        const tenantIds: string[] = [
            tenantId,
            'f8cdef31-a31e-4b4a-93e4-5f571e91255a', // US Gov MicrosoftServices.onmicrosoft.us
            'd6d49420-f39b-4df7-a1dc-d59a935871db', // Public botframework.com
        ];
        const validIssuers: string[] = [];
        tenantIds.forEach((tmpId: string) => {
            validIssuers.push(`https://sts.windows.net/${tmpId}/`); // Auth Public/US Gov, 1.0 token
            validIssuers.push(`https://login.microsoftonline.com/${tmpId}/v2.0`); // Auth Public, 2.0 token
            validIssuers.push(`https://login.microsoftonline.us/${tmpId}/v2.0`); // Auth for US Gov, 2.0 token
        });
        BetweenBotAndAseChannelTokenValidationParameters.issuer = validIssuers;
    }

    /**
     * Determines if a given Auth header is from the Bot Framework AseChannel
     *
     * @param {string} channelId The channelId.
     * @returns {boolean} True, if the token was issued by the AseChannel. Otherwise, false.
     */
    export function isTokenFromAseChannel(channelId: string): boolean {
        return channelId === ChannelId;
    }

    /**
     * Validate the incoming Auth Header as a token sent from the Bot Framework AseChannel.
     * A token issued by the Bot Framework will FAIL this check. Only AseChannel tokens will pass.
     *
     * @param {string} authHeader The raw HTTP header in the format: 'Bearer [longString]'
     * @param {AuthenticationConfiguration} authConfig The authentication configuration.
     * @returns {Promise<ClaimsIdentity>} A valid ClaimsIdentity.
     */
    export async function authenticateAseChannelToken(
        authHeader: string,
        authConfig: AuthenticationConfiguration = new AuthenticationConfiguration()
    ): Promise<ClaimsIdentity> {
        const tokenExtractor: JwtTokenExtractor = new JwtTokenExtractor(
            BetweenBotAndAseChannelTokenValidationParameters,
            MetadataUrl,
            AuthenticationConstants.AllowedSigningAlgorithms
        );

        const identity: ClaimsIdentity = await tokenExtractor.getIdentityFromAuthHeader(
            authHeader,
            ChannelId,
            authConfig.requiredEndorsements
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

        if (!(await _creadentialProvider.isValidAppId(appId))) {
            throw new AuthenticationError(
                `Unauthorized. Invalid AppId passed on token: ${appId}`,
                StatusCodes.UNAUTHORIZED
            );
        }

        return identity;
    }
}
