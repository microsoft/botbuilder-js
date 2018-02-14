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
var JwtTokenValidation;
(function (JwtTokenValidation) {
    /**
     * Validates the security tokens required by the Bot Framework Protocol. Throws on any exceptions.
     * @param  {Activity} activity The incoming Activity from the Bot Framework or the Emulator
     * @param  {string} authHeader The Bearer token included as part of the request
     * @param  {ICredentialProvider} credentials The set of valid credentials, such as the Bot Application ID
     * @returns {Promise} Promise acception when authorized correctly, Promise rejection when not authorized.
     */
    function assertValidActivity(activity, authHeader, credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!authHeader) {
                // No auth header was sent. We might be on the anonymous code path.
                let isAuthDisabled = yield credentials.isAuthenticationDisabled();
                if (isAuthDisabled) {
                    // We are on the anonymous code path.
                    return;
                }
                // No Auth Header. Auth is required. Request is not authorized.
                throw new Error('Unauthorized Access. Request is not authorized');
            }
            let usingEmulator = emulatorValidation_1.EmulatorValidation.isTokenFromEmulator(authHeader);
            if (usingEmulator) {
                yield emulatorValidation_1.EmulatorValidation.authenticateEmulatorToken(authHeader, credentials);
            }
            else {
                yield channelValidation_1.ChannelValidation.authenticateChannelTokenWithServiceUrl(authHeader, credentials, activity.serviceUrl);
            }
            // On the standard Auth path, we need to trust the URL that was incoming.
            microsoftAppCredentials_1.MicrosoftAppCredentials.trustServiceUrl(activity.serviceUrl);
        });
    }
    JwtTokenValidation.assertValidActivity = assertValidActivity;
})(JwtTokenValidation = exports.JwtTokenValidation || (exports.JwtTokenValidation = {}));
//# sourceMappingURL=jwtTokenValidation.js.map