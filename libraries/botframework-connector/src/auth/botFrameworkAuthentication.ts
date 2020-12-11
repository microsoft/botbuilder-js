// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Activity, CallerIdConstants } from 'botframework-schema';
import { AuthenticationConstants } from './authenticationConstants';
import { ClaimsIdentity } from './claimsIdentity';
import { ServiceClientCredentials } from '@azure/ms-rest-js';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { SkillValidation } from './skillValidation';
import { assert, Assertion } from 'botbuilder-stdlib';

export interface ProactiveCredentialsResult {
    credentials: ServiceClientCredentials;
    scope: string;
}

export interface AuthenticateRequestResult extends ProactiveCredentialsResult {
    claimsIdentity: ClaimsIdentity;
    callerId: string;
}

export abstract class BotFrameworkAuthentication {
    static assert: Assertion<BotFrameworkAuthentication> = assert.instanceOf(
        'BotFrameworkAuthentication',
        BotFrameworkAuthentication
    );

    static isType = assert.toTest(BotFrameworkAuthentication.assert);

    /**
     * Extract app ID from claims identity.
     *
     * @param {ClaimsIdentity} claimsIdentity claims identity from which app ID is extracted
     * @returns {string} the app ID
     */
    protected getAppId(claimsIdentity: ClaimsIdentity): string {
        let botAppIdClaim = claimsIdentity.claims.find((claim) => claim.type === AuthenticationConstants.AudienceClaim);

        if (!botAppIdClaim) {
            botAppIdClaim = claimsIdentity.claims.find((claim) => claim.type === AuthenticationConstants.AppIdClaim);
        }

        return botAppIdClaim?.value;
    }

    /**
     * Generate caller ID value.
     *
     * @param {ServiceClientCredentialsFactory} credentialFactory credential factory
     * @param {ClaimsIdentity} claimsIdentity claims ID from which to generate caller ID
     * @param {string | undefined} callerId fallback caller ID
     * @returns {string} the caller ID value
     */
    protected async generateCallerId(
        credentialFactory: ServiceClientCredentialsFactory,
        claimsIdentity: ClaimsIdentity,
        callerId?: string
    ): Promise<string> {
        if (await credentialFactory.isAuthenticationDisabled()) {
            return null;
        }

        if (SkillValidation.isSkillClaim(claimsIdentity.claims)) {
            return `${CallerIdConstants.BotToBotPrefix}${this.getAppId(claimsIdentity)}`;
        }

        return callerId;
    }

    abstract authenticateRequest(
        activity: Partial<Activity>,
        authHeader: string | undefined
    ): Promise<AuthenticateRequestResult>;

    abstract getProactiveCredentials(
        claimsIdentity: ClaimsIdentity,
        audience: string | undefined
    ): Promise<ProactiveCredentialsResult>;
}
