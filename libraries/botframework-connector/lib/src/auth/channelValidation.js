var constants_1 = require('./constants');
var jwtTokenExtractor_1 = require('./jwtTokenExtractor');
var ChannelValidation;
(function (ChannelValidation) {
    /**
     * TO BOT FROM CHANNEL: Token validation parameters when connecting to a bot
     */
    ChannelValidation.ToBotFromChannelTokenValidationParameters = {
        issuer: [constants_1.Constants.ToBotFromChannelTokenIssuer],
        audience: undefined,
        clockTolerance: 5 * 60,
        ignoreExpiration: false
    };
    async;
    function authenticateChannelTokenWithServiceUrl(authHeader, credentials, serviceUrl) {
        var identity = await, authenticateChannelToken = (authHeader, credentials);
        var serviceUrlClaim = identity.getClaimValue(constants_1.Constants.ServiceUrlClaim);
        if (serviceUrlClaim !== serviceUrl) {
            // Claim must match. Not Authorized.
            throw new Error('Unauthorized. ServiceUrl claim do not match.');
        }
        return identity;
    }
    async;
    function authenticateChannelToken(authHeader, credentials) {
        var tokenExtractor = new jwtTokenExtractor_1.JwtTokenExtractor(ChannelValidation.ToBotFromChannelTokenValidationParameters, constants_1.Constants.ToBotFromChannelOpenIdMetadataUrl, constants_1.Constants.AllowedSigningAlgorithms);
        var identity = await, tokenExtractor, getIdentityFromAuthHeader = (authHeader);
        if (!identity) {
            // No valid identity. Not Authorized.
            throw new Error('Unauthorized. No valid identity.');
        }
        if (!identity.isAuthenticated) {
            // The token is in some way invalid. Not Authorized.
            throw new Error('Unauthorized. Is not authenticated');
        }
        // Now check that the AppID in the claimset matches
        // what we're looking for. Note that in a multi-tenant bot, this value
        // comes from developer code that may be reaching out to a service, hence the
        // Async validation.
        // Look for the "aud" claim, but only if issued from the Bot Framework
        if (identity.getClaimValue(constants_1.Constants.IssuerClaim) !== constants_1.Constants.ToBotFromChannelTokenIssuer) {
            // The relevant Audiance Claim MUST be present. Not Authorized.
            throw new Error('Unauthorized. Audiance Claim MUST be present.');
        }
        // The AppId from the claim in the token must match the AppId specified by the developer. 
        // In this case, the token is destined for the app, so we find the app ID in the audience claim.
        var audClaim = identity.getClaimValue(constants_1.Constants.AudienceClaim);
        if (!(await))
            credentials.isValidAppId(audClaim || "");
        {
            // The AppId is not valid or not present. Not Authorized.
            throw new Error("Unauthorized. Invalid AppId passed on token: " + audClaim);
        }
        return identity;
    }
})(ChannelValidation = exports.ChannelValidation || (exports.ChannelValidation = {}));
//# sourceMappingURL=channelValidation.js.map