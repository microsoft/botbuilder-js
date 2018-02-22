/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * Represents a claim.
 */
export interface Claim {
    readonly type: string;
    readonly value: string;
}

/**
 * Represents a claims-based identity.
 */
export class ClaimsIdentity {
    readonly isAuthenticated: boolean;
    readonly claims: Claim[];

    constructor(claims: Claim[], isAuthenticated: boolean) {
        this.claims = claims;
        this.isAuthenticated = true;
    }

    /**
     * Returns a claim value (if its present)
     * @param  {string} claimType The claim type to look for
     * @returns {string|null} The claim value or null if not found
     */
    getClaimValue(claimType: string): string | null {
        let claim = this.claims.find(c => c.type === claimType);
        return claim ? claim.value : null;
    }
}