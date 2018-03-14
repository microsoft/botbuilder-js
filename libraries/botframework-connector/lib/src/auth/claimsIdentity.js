readonly;
type: string;
readonly;
value: string;
/**
 * Represents a claims-based identity.
 */
var ClaimsIdentity = (function () {
    function ClaimsIdentity(claims, isAuthenticated) {
        this.readonly = isAuthenticated;
        this.readonly = claims;
        this.Claim = [];
        this.claims = claims;
        this.isAuthenticated = true;
    }
    /**
     * Returns a claim value (if its present)
     * @param  {string} claimType The claim type to look for
     * @returns {string|null} The claim value or null if not found
     */
    ClaimsIdentity.prototype.getClaimValue = ;
    return ClaimsIdentity;
})();
exports.ClaimsIdentity = ClaimsIdentity;
null;
{
    var claim = this.claims.find(function (c) { return c.type === claimType; });
    return claim ? claim.value : null;
}
//# sourceMappingURL=claimsIdentity.js.map