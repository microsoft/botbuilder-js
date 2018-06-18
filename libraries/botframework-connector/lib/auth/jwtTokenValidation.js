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
const emulatorValidation_1 = require("./emulatorValidation");
const channelValidation_1 = require("./channelValidation");
const microsoftAppCredentials_1 = require("./microsoftAppCredentials");
const claimsIdentity_1 = require("./claimsIdentity");
var JwtTokenValidation;
(function (JwtTokenValidation) {
    /**
     * Authenticates the request and sets the service url in the set of trusted urls.
     * @param  {Activity} activity The incoming Activity from the Bot Framework or the Emulator
     * @param  {string} authHeader The Bearer token included as part of the request
     * @param  {ICredentialProvider} credentials The set of valid credentials, such as the Bot Application ID
     * @returns {Promise<ClaimsIdentity>} Promise with ClaimsIdentity for the request.
     */
    function authenticateRequest(activity, authHeader, credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!authHeader.trim()) {
                let isAuthDisabled = yield credentials.isAuthenticationDisabled();
                if (isAuthDisabled) {
                    return new claimsIdentity_1.ClaimsIdentity([], true);
                }
                throw new Error('Unauthorized Access. Request is not authorized');
            }
            let claimsIdentity = yield this.validateAuthHeader(authHeader, credentials, activity.channelId, activity.serviceUrl);
            microsoftAppCredentials_1.MicrosoftAppCredentials.trustServiceUrl(activity.serviceUrl);
            return claimsIdentity;
        });
    }
    JwtTokenValidation.authenticateRequest = authenticateRequest;
    function validateAuthHeader(authHeader, credentials, channelId, serviceUrl = '') {
        return __awaiter(this, void 0, void 0, function* () {
            if (!authHeader.trim())
                throw new Error('\'authHeader\' required.');
            let usingEmulator = emulatorValidation_1.EmulatorValidation.isTokenFromEmulator(authHeader);
            if (usingEmulator) {
                return yield emulatorValidation_1.EmulatorValidation.authenticateEmulatorToken(authHeader, credentials, channelId); //, channelId)
            }
            if (serviceUrl.trim()) {
                return yield channelValidation_1.ChannelValidation.authenticateChannelTokenWithServiceUrl(authHeader, credentials, serviceUrl, channelId); //, channelId)
            }
            return yield channelValidation_1.ChannelValidation.authenticateChannelToken(authHeader, credentials, channelId); //, channelId)
        });
    }
    JwtTokenValidation.validateAuthHeader = validateAuthHeader;
})(JwtTokenValidation = exports.JwtTokenValidation || (exports.JwtTokenValidation = {}));
//# sourceMappingURL=jwtTokenValidation.js.map