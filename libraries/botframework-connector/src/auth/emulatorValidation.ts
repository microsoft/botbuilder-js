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
import { GovernmentConstants } from './governmentConstants';
import { ICredentialProvider } from './credentialProvider';
import { JwtTokenValidation } from './jwtTokenValidation';
import { StatusCodes } from 'botframework-schema';
import { decode, VerifyOptions } from 'jsonwebtoken';

const verifyOptions: VerifyOptions = {
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

const validateIdentity: IdentityValidator = async (credentials, identity) => {
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

    if (!(await credentials.isValidAppId(appId))) {
        throw new AuthenticationError(
            `Unauthorized. Invalid AppId passed on token: ${appId}`,
            StatusCodes.UNAUTHORIZED
        );
    }
};

/**
 * Construct an emulator auth validator using a specific open ID metadata url
 *
 * @param {string} openIdMetadataUrl url to fetch open ID metadata
 * @returns {AuthValidator} an emulator auth validator
 */
export function makeEmulatorAuthValidator(openIdMetadataUrl: string): AuthValidator {
    return makeAuthValidator(verifyOptions, openIdMetadataUrl, validateIdentity);
}

export const emulatorAuthValidator = makeEmulatorAuthValidator(
    AuthenticationConstants.ToBotFromEmulatorOpenIdMetadataUrl
);

export const governmentEmulatorAuthValidator = makeEmulatorAuthValidator(
    GovernmentConstants.ToBotFromEmulatorOpenIdMetadataUrl
);

/**
 * Validates and Examines JWT tokens from the Bot Framework Emulator
 */
export namespace EmulatorValidation {
    /**
     * TO BOT FROM EMULATOR: Token validation parameters when connecting to a channel.
     */
    export const ToBotFromEmulatorTokenValidationParameters = verifyOptions;

    /**
     * Determines if a given Auth header is from the Bot Framework Emulator
     * @param  {string} authHeader Bearer Token, in the "Bearer [Long String]" Format.
     * @returns {boolean} True, if the token was issued by the Emulator. Otherwise, false.
     */
    export function isTokenFromEmulator(authHeader: string): boolean {
        // The Auth Header generally looks like this:
        // "Bearer eyJ0e[...Big Long String...]XAiO"
        if (!authHeader) {
            // No token. Can't be an emulator token.
            return false;
        }

        const parts: string[] = authHeader.split(' ');
        if (parts.length !== 2) {
            // Emulator tokens MUST have exactly 2 parts. If we don't have 2 parts, it's not an emulator token
            return false;
        }

        const authScheme: string = parts[0];
        const bearerToken: string = parts[1];

        // We now have an array that should be:
        // [0] = "Bearer"
        // [1] = "[Big Long String]"
        if (authScheme !== 'Bearer') {
            // The scheme from the emulator MUST be "Bearer"
            return false;
        }

        // Parse the Big Long String into an actual token.
        const token: any = decode(bearerToken, { complete: true });
        if (!token) {
            return false;
        }

        // Is there an Issuer?
        const issuer: string = token.payload.iss;
        if (!issuer) {
            // No Issuer, means it's not from the Emulator.
            return false;
        }

        // Is the token issues by a source we consider to be the emulator?
        if (
            ToBotFromEmulatorTokenValidationParameters.issuer &&
            ToBotFromEmulatorTokenValidationParameters.issuer.indexOf(issuer) === -1
        ) {
            // Not a Valid Issuer. This is NOT a Bot Framework Emulator Token.
            return false;
        }

        // The Token is from the Bot Framework Emulator. Success!
        return true;
    }

    /**
     * Validate the incoming Auth Header as a token sent from the Bot Framework Emulator.
     * A token issued by the Bot Framework will FAIL this check. Only Emulator tokens will pass.
     * @param  {string} authHeader The raw HTTP header in the format: "Bearer [longString]"
     * @param  {ICredentialProvider} credentials The user defined set of valid credentials, such as the AppId.
     * @param  {string} channelService The channelService value that distinguishes public Azure from US Government Azure.
     * @param  {string} channelId
     * @param  {AuthenticationConfiguration} authConfig
     * @returns {Promise<ClaimsIdentity>} A valid ClaimsIdentity.
     */
    export async function authenticateEmulatorToken(
        authHeader: string,
        credentials: ICredentialProvider,
        channelService: string,
        channelId: string,
        authConfig: AuthenticationConfiguration = new AuthenticationConfiguration()
    ): Promise<ClaimsIdentity> {
        if (JwtTokenValidation.isGovernment(channelService)) {
            return governmentEmulatorAuthValidator(credentials, authConfig, authHeader, { channelId });
        } else {
            return emulatorAuthValidator(credentials, authConfig, authHeader, { channelId });
        }
    }
}
