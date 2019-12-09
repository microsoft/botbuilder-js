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

export const GovConstants = {
    ToBotFromChannelTokenIssuer: 'https://api.botframework.us'
}

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
export function isSkillClaim(claims: { [key: string]: any }[]): boolean {
    if (!claims) {
        throw new TypeError(`isSkillClaim(): missing claims.`);
    }
    const versionClaim = claims.find(c => c.type === AuthConstants.VersionClaim);
    const versionValue = versionClaim && versionClaim.value;
    if (!versionValue) {
        // Must have a version claim.
        return false;
    }

    const audClaim = claims.find(c => c.type === AuthConstants.AudienceClaim);
    const audienceValue = audClaim && audClaim.value;
    if (!audClaim || AuthConstants.ToBotFromChannelTokenIssuer === audienceValue || GovConstants.ToBotFromChannelTokenIssuer === audienceValue) {
        // The audience is https://api.botframework.com and not an appId.
        return false;
    }

    const appId = getAppIdFromClaims(claims);
    if (!appId) {
        return false;
    }

    // Skill claims must contain and app ID and the AppID must be different than the audience.
    return appId !== audienceValue;
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
export function getAppIdFromClaims(claims: { [key: string]: any }[]): string {
    if (!claims) {
        throw new TypeError(`getAppIdFromClaims(): missing claims.`);
    }
    let appId: string;

        // Depending on Version, the AppId is either in the
        // appid claim (Version 1) or the 'azp' claim (Version 2).
        const versionClaim = claims.find(c => c.type === AuthConstants.VersionClaim);
        const versionValue = versionClaim && versionClaim.value;
        if (!versionValue || versionValue === '1.0') {
            // No version or a version of '1.0' means we should look for
            // the claim in the 'appid' claim.
            const appIdClaim = claims.find(c => c.type === AuthConstants.AppIdClaim);
            appId = appIdClaim && appIdClaim.value;
        } else if (versionValue === '2.0') {
            // Version '2.0' puts the AppId in the 'azp' claim.
            const azpClaim = claims.find(c => c.type === AuthConstants.AuthorizedParty);
            appId = azpClaim && azpClaim.value;
        }

        return appId;
}
