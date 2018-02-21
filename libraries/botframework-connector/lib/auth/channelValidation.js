"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const jwtTokenExtractor_1 = require("./jwtTokenExtractor");
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
    /**
     * Validate the incoming Auth Header as a token sent from the Bot Framework Service.
     * A token issued by the Bot Framework emulator will FAIL this check.
     * @param  {string} authHeader The raw HTTP header in the format: "Bearer [longString]"
     * @param  {ICredentialProvider} credentials The user defined set of valid credentials, such as the AppId.
     * @param  {string} serviceUrl The ServiceUrl Claim value that must match in the identity.
     * @returns {Promise<ClaimsIdentity>} A valid ClaimsIdentity.
     */
    function authenticateChannelTokenWithServiceUrl(authHeader, credentials, serviceUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            let identity = yield authenticateChannelToken(authHeader, credentials);
            let serviceUrlClaim = identity.getClaimValue(constants_1.Constants.ServiceUrlClaim);
            if (serviceUrlClaim !== serviceUrl) {
                // Claim must match. Not Authorized.
                throw new Error('Unauthorized. ServiceUrl claim do not match.');
            }
            return identity;
        });
    }
    ChannelValidation.authenticateChannelTokenWithServiceUrl = authenticateChannelTokenWithServiceUrl;
    /**
     * Validate the incoming Auth Header as a token sent from the Bot Framework Service.
     * A token issued by the Bot Framework emulator will FAIL this check.
     * @param  {string} authHeader The raw HTTP header in the format: "Bearer [longString]"
     * @param  {ICredentialProvider} credentials The user defined set of valid credentials, such as the AppId.
     * @returns {Promise<ClaimsIdentity>} A valid ClaimsIdentity.
     */
    function authenticateChannelToken(authHeader, credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokenExtractor = new jwtTokenExtractor_1.JwtTokenExtractor(ChannelValidation.ToBotFromChannelTokenValidationParameters, constants_1.Constants.ToBotFromChannelOpenIdMetadataUrl, constants_1.Constants.AllowedSigningAlgorithms);
            let identity = yield tokenExtractor.getIdentityFromAuthHeader(authHeader);
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
            let audClaim = identity.getClaimValue(constants_1.Constants.AudienceClaim);
            if (!(yield credentials.isValidAppId(audClaim || ""))) {
                // The AppId is not valid or not present. Not Authorized.
                throw new Error(`Unauthorized. Invalid AppId passed on token: ${audClaim}`);
            }
            return identity;
        });
    }
    ChannelValidation.authenticateChannelToken = authenticateChannelToken;
})(ChannelValidation = exports.ChannelValidation || (exports.ChannelValidation = {}));
//# sourceMappingURL=channelValidation.js.map