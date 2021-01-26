// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Activity, Channels, RoleTypes, StatusCodes } from 'botframework-schema';
import { AuthenticationConfiguration } from './authenticationConfiguration';
import { AuthenticationConstants } from './authenticationConstants';
import { AuthenticationError } from './authenticationError';
import { ClaimsIdentity } from './claimsIdentity';
import { ClaimsIdentityValidator } from './claimsIdentityValidator';
import { ICredentialProvider } from './credentialProvider';
import { JwtTokenExtractor } from './jwtTokenExtractor';
import { VerifyOptions } from 'jsonwebtoken';

export class AuthHeaderValidator {
    constructor(
        private readonly verifyOptions: VerifyOptions,
        private readonly openIdMetadataUrl: string,
        private readonly identityValidator: ClaimsIdentityValidator
    ) {}

    async validate(
        credentials: ICredentialProvider,
        authConfig: AuthenticationConfiguration,
        authHeader: string,
        activity: Partial<Activity>
    ): Promise<ClaimsIdentity> {
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
            this.verifyOptions,
            this.openIdMetadataUrl,
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

        await this.identityValidator.validate(credentials, claimsIdentity, activity);

        return claimsIdentity;
    }
}
