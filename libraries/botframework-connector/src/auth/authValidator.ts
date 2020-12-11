// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Activity, Channels, RoleTypes, StatusCodes } from 'botframework-schema';
import { AuthenticationConfiguration } from './authenticationConfiguration';
import { AuthenticationConstants } from './authenticationConstants';
import { AuthenticationError } from './authenticationError';
import { ClaimsIdentity } from './claimsIdentity';
import { ICredentialProvider } from './credentialProvider';
import { JwtTokenExtractor } from './jwtTokenExtractor';
import { VerifyOptions } from 'jsonwebtoken';

// AuthValidator is a function signature for logic that validates an HTTP auth header
export type AuthValidator = (
    credentials: ICredentialProvider,
    authConfig: AuthenticationConfiguration,
    authHeader: string,
    activity: Partial<Activity>
) => Promise<ClaimsIdentity>;

// IdentityValidator is a function signature for logic that validates a set of JWT identity claims
export type IdentityValidator = (
    credentials: ICredentialProvider,
    claimsIdentity: ClaimsIdentity,
    activity: Partial<Activity>
) => Promise<void>;

/**
 * Make an auth validator
 *
 * @param {VerifyOptions} verifyOptions options for verifying JWTs
 * @param {string} openIdMetadata url to fetch open ID metadata
 * @param {IdentityValidator} identityValidator the identity validator logic
 * @returns {AuthValidator} an auth validator function
 */
export function makeAuthValidator(
    verifyOptions: VerifyOptions,
    openIdMetadata: string,
    identityValidator: IdentityValidator
): AuthValidator {
    return async (credentials, authConfig, authHeader, activity) => {
        if (!authHeader.trim()) {
            const isAuthDisabled = await credentials.isAuthenticationDisabled();
            if (!isAuthDisabled) {
                throw new AuthenticationError(
                    'Unauthorized Access. Request is not authorized',
                    StatusCodes.UNAUTHORIZED
                );
            }

            // Represents an anonymous skill claim
            if (activity.channelId === Channels.Emulator && activity.recipient?.role === RoleTypes.Skill) {
                return new ClaimsIdentity(
                    [
                        {
                            type: AuthenticationConstants.AppIdClaim,
                            value: AuthenticationConstants.AnonymousSkillAppId,
                        },
                    ],
                    AuthenticationConstants.AnonymousAuthType
                );
            }

            // Represents an anonymous claim
            return new ClaimsIdentity([], AuthenticationConstants.AnonymousAuthType);
        }

        const tokenExtractor = new JwtTokenExtractor(
            verifyOptions,
            openIdMetadata,
            AuthenticationConstants.AllowedSigningAlgorithms
        );

        const claimsIdentity = await tokenExtractor.getIdentityFromAuthHeader(
            authHeader.trim(),
            activity.channelId,
            authConfig.requiredEndorsements
        );

        if (!claimsIdentity) {
            throw new AuthenticationError('Unauthorized. Is not authenticated', StatusCodes.UNAUTHORIZED);
        }

        if (!claimsIdentity.isAuthenticated) {
            throw new AuthenticationError('Unauthorized. Is not authenticated', StatusCodes.UNAUTHORIZED);
        }

        await identityValidator(credentials, claimsIdentity, activity);

        return claimsIdentity;
    };
}
