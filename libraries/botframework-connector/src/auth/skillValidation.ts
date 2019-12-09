/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { decode, VerifyOptions } from 'jsonwebtoken';

import { AuthenticationConfiguration } from './authenticationConfiguration';
import { AuthenticationConstants } from './authenticationConstants';
import { Claim, ClaimsIdentity } from './claimsIdentity';
import { ICredentialProvider } from './credentialProvider';
import { GovernmentConstants } from './governmentConstants';
import { JwtTokenExtractor } from './jwtTokenExtractor';
import { JwtTokenValidation } from './jwtTokenValidation';

/**
 * Validates JWT tokens sent to and from a Skill.
 */
export namespace SkillValidation {
    /**
     * TO SKILL FROM BOT and TO BOT FROM SKILL: Token validation parameters when connecting a bot to a skill.
     */
    const _tokenValidationParameters: VerifyOptions = {
        issuer: [
            'https://sts.windows.net/d6d49420-f39b-4df7-a1dc-d59a935871db/',                    // Auth v3.1, 1.0 token
            'https://login.microsoftonline.com/d6d49420-f39b-4df7-a1dc-d59a935871db/v2.0',      // Auth v3.1, 2.0 token
            'https://sts.windows.net/f8cdef31-a31e-4b4a-93e4-5f571e91255a/',                    // Auth v3.2, 1.0 token
            'https://login.microsoftonline.com/f8cdef31-a31e-4b4a-93e4-5f571e91255a/v2.0',      // Auth v3.2, 2.0 token
            'https://sts.windows.net/72f988bf-86f1-41af-91ab-2d7cd011db47/',                    // ???
            'https://sts.windows.net/cab8a31a-1906-4287-a0d8-4eef66b95f6e/',                    // US Gov Auth, 1.0 token
            'https://login.microsoftonline.us/cab8a31a-1906-4287-a0d8-4eef66b95f6e/v2.0',       // US Gov Auth, 2.0 token
        ],
        audience: undefined, // Audience validation takes place manually in code.
        clockTolerance: 5 * 60,
        ignoreExpiration: false
    };

    /**
     * Determines if a given Auth header is from a skill to bot or bot to skill request.
     * @param  {string} authHeader Bearer Token, in the "Bearer [Long String]" Format.
     * @returns {boolean} True, if the token was issued for a skill to bot communication. Otherwise, false.
     */
    export function isSkillToken(authHeader: string): boolean {
        if (!JwtTokenValidation.isValidTokenFormat(authHeader)) {
            return false;
        }

        // We know is a valid token, split it and work with it:
        // [0] = "Bearer"
        // [1] = "[Big Long String]"
        const bearerToken: string = authHeader.trim().split(' ')[1];

        // Parse the Big Long String into an actual token.
        const payload: any = decode(bearerToken);

        const claims: Claim[] = Object.keys(payload).reduce(
            (acc: any, key: any) => {
                acc.push({ type: key, value: payload[key] });

                return acc;
            },
            <Claim[]>[]
        );

        return isSkillClaim(claims);
    }

    /**
     * Checks if the given object of claims represents a skill.
     * @remarks
     * A skill claim should contain:
     *     An "AuthenticationConstants.VersionClaim" claim.
     *     An "AuthenticationConstants.AudienceClaim" claim.
     *     An "AuthenticationConstants.AppIdClaim" claim (v1) or an a "AuthenticationConstants.AuthorizedParty" claim (v2).
     * And the appId claim should be different than the audience claim.
     * The audience claim should be a guid, indicating that it is from another bot/skill.
     * @param claims An object of claims.
     * @returns {boolean} True if the object of claims is a skill claim, false if is not.
     */
    export function isSkillClaim(claims: Claim[]): boolean {
        if (!claims) {
            throw new TypeError(`SkillValidation.isSkillClaim(): missing claims.`);
        }

        const versionClaim = claims.find(c => c.type === AuthenticationConstants.VersionClaim);
        const versionValue = versionClaim && versionClaim.value;
        if (!versionValue) {
            // Must have a version claim.
            return false;
        }

        const audClaim = claims.find(c => c.type === AuthenticationConstants.AudienceClaim);
        const audienceValue = audClaim && audClaim.value;
        if (!audClaim || AuthenticationConstants.ToBotFromChannelTokenIssuer === audienceValue || GovernmentConstants.ToBotFromChannelTokenIssuer === audienceValue) {
            // The audience is https://api.botframework.com and not an appId.
            return false;
        }

        const appId = JwtTokenValidation.getAppIdFromClaims(claims);
        if (!appId) {
            return false;
        }

        // Skill claims must contain and app ID and the AppID must be different than the audience.
        return appId !== audienceValue;
    }

    /**
     * Validates that the incoming Auth Header is a token sent from a bot to a skill or from a skill to a bot.
     * @param authHeader The raw HTTP header in the format: "Bearer [longString]".
     * @param credentials The user defined set of valid credentials, such as the AppId.
     * @param channelService The channelService value that distinguishes public Azure from US Government Azure.
     * @param channelId The ID of the channel to validate.
     * @param authConfig The authentication configuration.
     * @returns {Promise<ClaimsIdentity>} A "ClaimsIdentity" instance if the validation is successful.
     */
    export async function authenticateChannelToken(
        authHeader: string,
        credentials: ICredentialProvider,
        channelService: string,
        channelId: string,
        authConfig: AuthenticationConfiguration): Promise<ClaimsIdentity> {
        if (!authConfig) {
            throw new Error('SkillValidation.authenticateChannelToken(): invalid authConfig parameter');
        }

        const openIdMetadataUrl = JwtTokenValidation.isGovernment(channelService) ?
            GovernmentConstants.ToBotFromEmulatorOpenIdMetadataUrl : 
            AuthenticationConstants.ToBotFromEmulatorOpenIdMetadataUrl;

        const tokenExtractor = new JwtTokenExtractor(
            _tokenValidationParameters,
            openIdMetadataUrl,
            AuthenticationConstants.AllowedSigningAlgorithms);

        const parts: string[] = authHeader.split(' ');
        const identity = await tokenExtractor.getIdentity(parts[0], parts[1], channelId, authConfig.requiredEndorsements);

        await validateIdentity(identity, credentials);

        return identity;
    }

    /**
     * @ignore
     * @private
     * @param identity 
     * @param credentials 
     */
    export async function validateIdentity(identity: ClaimsIdentity, credentials: ICredentialProvider): Promise<void> {
        if (!identity) {
            // No valid identity. Not Authorized.
            throw new Error('SkillValidation.validateIdentity(): Invalid identity');
        }

        if (!identity.isAuthenticated) {
            // The token is in some way invalid. Not Authorized.
            throw new Error('SkillValidation.validateIdentity(): Token not authenticated');
        }

        const versionClaim = identity.getClaimValue(AuthenticationConstants.VersionClaim);
        // const versionClaim = identity.claims.FirstOrDefault(c => c.Type == AuthenticationConstants.VersionClaim);
        if (!versionClaim) {
            // No version claim
            throw new Error(`SkillValidation.validateIdentity(): '${AuthenticationConstants.VersionClaim}' claim is required on skill Tokens.`);
        }

        // Look for the "aud" claim, but only if issued from the Bot Framework
        const audienceClaim = identity.getClaimValue(AuthenticationConstants.AudienceClaim);
        if (!audienceClaim) {
            // Claim is not present or doesn't have a value. Not Authorized.
            throw new Error(`SkillValidation.validateIdentity(): '${AuthenticationConstants.AudienceClaim}' claim is required on skill Tokens.`);
        }

        if (!await credentials.isValidAppId(audienceClaim)) {
            // The AppId is not valid. Not Authorized.
            throw new Error('SkillValidation.validateIdentity(): Invalid audience.');
        }
        
        const appId = JwtTokenValidation.getAppIdFromClaims(identity.claims);
        if (!appId) {
            // Invalid appId
            throw new Error('SkillValidation.validateIdentity(): Invalid appId.');
        }

        // TODO: check the appId against the registered skill client IDs.
        // Check the AppId and ensure that only works against my whitelist authConfig can have info on how to get the
        // whitelist AuthenticationConfiguration
        // We may need to add a ClaimsIdentityValidator delegate or class that allows the dev to inject a custom validator.
    }
}
