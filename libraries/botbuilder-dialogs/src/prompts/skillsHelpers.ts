/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// These internally exported constants and methods are duplicates of the AuthenticationConstants, JwtTokenValidation
//  and SkillValidation exports from the Node.js-reliant botframework-connector library.
// The contents of this file should NOT be exported as this is a temporary patch for supporting Skills in
// Node.js bots without making botbuilder-dialogs not browser-compatible.
// isSkillClaim() is the only method directly called by the OAuthPrompt, but the other contents of this file are exported to facilitate the usage of the same tests as in botframework-connector.

export const AuthConstants = {
    AppIdClaim: 'appid',
    AudienceClaim: 'aud',
    AuthorizedParty: 'azp',
    ToBotFromChannelTokenIssuer: 'https://api.botframework.com',
    VersionClaim: 'ver'
};

/**
 * @ignore
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
export function isSkillClaim(claims: { [key: string]: any }): boolean {
    if (!claims) {
        throw new TypeError(`isSkillClaim(): missing claims.`);
    }

    const versionClaim = claims[AuthConstants.VersionClaim];
    if (!versionClaim) {
        // Must have a version claim.
        return false;
    }

    const audClaim = claims[AuthConstants.AudienceClaim];
    if (!audClaim || AuthConstants.ToBotFromChannelTokenIssuer === audClaim) {
        // The audience is https://api.botframework.com and not an appId.
        return false;
    }

    const appId = getAppIdFromClaims(claims);
    if (!appId) {
        return false;
    }

    // Skill claims must contain and app ID and the AppID must be different than the audience.
    return appId !== audClaim;
}

/**
 * @ignore
 * Gets the AppId from a claims list.
 * @remarks
 * In v1 tokens the AppId is in the "ver" AuthenticationConstants.AppIdClaim claim.
 * In v2 tokens the AppId is in the "azp" AuthenticationConstants.AuthorizedParty claim.
 * If the AuthenticationConstants.VersionClaim is not present, this method will attempt to
 * obtain the attribute from the AuthenticationConstants.AppIdClaim or if present.
 * 
 * Throws a TypeError if claims is falsy.
 * @param claims An object containing claims types and their values.
 */
export function getAppIdFromClaims(claims: { [key: string]: any }): string {
    if (!claims) {
        throw new TypeError(`getAppIdFromClaims(): missing claims.`);
    }
    let appId: string;

    // Depending on Version, the AppId is either in the
    // appid claim (Version 1) or the 'azp' claim (Version 2).
    const tokenClaim = claims[AuthConstants.VersionClaim];
    if (!tokenClaim || tokenClaim === '1.0') {
        // No version or a version of '1.0' means we should look for
        // the claim in the 'appid' claim.
        appId = claims[AuthConstants.AppIdClaim];
    } else if (tokenClaim === '2.0') {
        // Version '2.0' puts the AppId in the 'azp' claim.
        appId = claims[AuthConstants.AuthorizedParty];
    }

    return appId;
}

/**
 * Used to loosely check if an object is a ClaimsIdentity.
 * Returns a boolean.
 */
export function isClaimsIdentity(claims: any) {
    if (!claims) return false;
    if (typeof claims !== 'object') return false;
    if (!claims[AuthConstants.AudienceClaim]) {
        return false;
    }
    if (!claims[AuthConstants.AppIdClaim] && !claims[AuthConstants.AuthorizedParty]) {
        return false;
    }
    return true;
}
