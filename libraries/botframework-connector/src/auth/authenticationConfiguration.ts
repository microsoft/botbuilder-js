/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Claim } from './claimsIdentity';

/**
 * Used to validate a list of Claims and should throw an exception if the validation fails.
 */
export type ValidateClaims = (claims: Claim[]) => Promise<void>;

export class AuthenticationConfiguration {
    /**
     * General configuration settings for authentication.
     * @param requiredEndorsements 
     * @param validateClaims Function that validates a list of Claims and should throw an exception if the validation fails.
     */
    constructor(
        public requiredEndorsements: string[] = [],
        public validateClaims?: ValidateClaims
        ) { }
}
