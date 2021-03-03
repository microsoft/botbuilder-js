// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import assert from 'assert';
import { JwtTokenValidation, SkillValidation, ValidateClaims } from 'botframework-connector';

/**
 * Create an allowe callers claims validator
 *
 * @param allowedCallers allowed callers of skill
 * @returns claims validator function
 */
export function allowedCallersClaimsValidator(allowedCallers: string[]): ValidateClaims {
    assert.ok(allowedCallers);
    assert.ok(allowedCallers.length);

    const allowed = new Set(allowedCallers);

    return async (claims) => {
        if (!allowed.has('*') && SkillValidation.isSkillClaim(claims)) {
            const appId = JwtTokenValidation.getAppIdFromClaims(claims);
            if (!allowed.has(appId)) {
                throw new Error(
                    `Received a request from an application with an appID of "${appId}". To enable requests from this skill, add the skill to your configuration file.`
                );
            }
        }
    };
}
