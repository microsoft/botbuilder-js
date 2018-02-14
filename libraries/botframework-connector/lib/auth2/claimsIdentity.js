"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents a claims-based identity.
 */
class ClaimsIdentity {
    constructor(claims, isAuthenticated) {
        this.claims = claims;
        this.isAuthenticated = true;
    }
    /**
     * Returns a claim value (if its present)
     * @param  {string} claimType The claim type to look for
     * @returns {string|null} The claim value or null if not found
     */
    getClaimValue(claimType) {
        let claim = this.claims.find(c => c.type === claimType);
        return claim ? claim.value : null;
    }
}
exports.ClaimsIdentity = ClaimsIdentity;
//# sourceMappingURL=claimsIdentity.js.map