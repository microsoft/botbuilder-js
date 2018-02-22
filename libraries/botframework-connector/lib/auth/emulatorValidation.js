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
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const jwt = require("jsonwebtoken");
const jwtTokenExtractor_1 = require("./jwtTokenExtractor");
const constants_1 = require("./constants");
/**
 * Validates and Examines JWT tokens from the Bot Framework Emulator
 */
var EmulatorValidation;
(function (EmulatorValidation) {
    /**
     * TO BOT FROM EMULATOR: Token validation parameters when connecting to a channel.
     */
    EmulatorValidation.ToBotFromEmulatorTokenValidationParameters = {
        issuer: [
            'https://sts.windows.net/d6d49420-f39b-4df7-a1dc-d59a935871db/',
            'https://login.microsoftonline.com/d6d49420-f39b-4df7-a1dc-d59a935871db/v2.0',
            'https://sts.windows.net/f8cdef31-a31e-4b4a-93e4-5f571e91255a/',
            'https://login.microsoftonline.com/f8cdef31-a31e-4b4a-93e4-5f571e91255a/v2.0',
            'https://sts.windows.net/72f988bf-86f1-41af-91ab-2d7cd011db47/' // ???
        ],
        audience: undefined,
        clockTolerance: 5 * 60,
        ignoreExpiration: false
    };
    /**
     * Determines if a given Auth header is from the Bot Framework Emulator
     * @param  {string} authHeader Bearer Token, in the "Bearer [Long String]" Format.
     * @returns {boolean} True, if the token was issued by the Emulator. Otherwise, false.
     */
    function isTokenFromEmulator(authHeader) {
        // The Auth Header generally looks like this:
        // "Bearer eyJ0e[...Big Long String...]XAiO"
        if (!authHeader) {
            // No token. Can't be an emulator token.
            return false;
        }
        let parts = authHeader.split(' ');
        if (parts.length !== 2) {
            // Emulator tokens MUST have exactly 2 parts. If we don't have 2 parts, it's not an emulator token
            return false;
        }
        let authScheme = parts[0];
        let bearerToken = parts[1];
        // We now have an array that should be:
        // [0] = "Bearer"
        // [1] = "[Big Long String]"
        if (authScheme !== 'Bearer') {
            // The scheme from the emulator MUST be "Bearer"
            return false;
        }
        // Parse the Big Long String into an actual token.
        let token = jwt.decode(bearerToken, { complete: true });
        if (!token) {
            return false;
        }
        // Is there an Issuer?
        let issuer = token.payload.iss;
        if (!issuer) {
            // No Issuer, means it's not from the Emulator.
            return false;
        }
        // Is the token issues by a source we consider to be the emulator?
        if (EmulatorValidation.ToBotFromEmulatorTokenValidationParameters.issuer && EmulatorValidation.ToBotFromEmulatorTokenValidationParameters.issuer.indexOf(issuer) === -1) {
            // Not a Valid Issuer. This is NOT a Bot Framework Emulator Token.
            return false;
        }
        // The Token is from the Bot Framework Emulator. Success!
        return true;
    }
    EmulatorValidation.isTokenFromEmulator = isTokenFromEmulator;
    /**
     * Validate the incoming Auth Header as a token sent from the Bot Framework Emulator.
     * A token issued by the Bot Framework will FAIL this check. Only Emulator tokens will pass.
     * @param  {string} authHeader The raw HTTP header in the format: "Bearer [longString]"
     * @param  {ICredentialProvider} credentials The user defined set of valid credentials, such as the AppId.
     * @returns {Promise<ClaimsIdentity>} A valid ClaimsIdentity.
     */
    function authenticateEmulatorToken(authHeader, credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokenExtractor = new jwtTokenExtractor_1.JwtTokenExtractor(EmulatorValidation.ToBotFromEmulatorTokenValidationParameters, constants_1.Constants.ToBotFromEmulatorOpenIdMetadataUrl, constants_1.Constants.AllowedSigningAlgorithms);
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
            let versionClaim = identity.getClaimValue(constants_1.Constants.VersionClaim);
            if (versionClaim === null) {
                throw new Error('Unauthorized. "ver" claim is required on Emulator Tokens.');
            }
            let appId = '';
            // The Emulator, depending on Version, sends the AppId via either the
            // appid claim (Version 1) or the Authorized Party claim (Version 2).
            if (!versionClaim || versionClaim === '1.0') {
                // either no Version or a version of "1.0" means we should look for
                // the claim in the "appid" claim.
                let appIdClaim = identity.getClaimValue(constants_1.Constants.AppIdClaim);
                if (!appIdClaim) {
                    // No claim around AppID. Not Authorized.
                    throw new Error('Unauthorized. "appid" claim is required on Emulator Token version "1.0".');
                }
                appId = appIdClaim;
            }
            else if (versionClaim === '2.0') {
                // Emulator, "2.0" puts the AppId in the "azp" claim.
                let appZClaim = identity.getClaimValue(constants_1.Constants.AuthorizedParty);
                if (!appZClaim) {
                    // No claim around AppID. Not Authorized.
                    throw new Error('Unauthorized. "azp" claim is required on Emulator Token version "2.0".');
                }
                appId = appZClaim;
            }
            else {
                // Unknown Version. Not Authorized.
                throw new Error(`Unauthorized. Unknown Emulator Token version "${versionClaim}".`);
            }
            if (!(yield credentials.isValidAppId(appId))) {
                throw new Error(`Unauthorized. Invalid AppId passed on token: ${appId}`);
            }
            return identity;
        });
    }
    EmulatorValidation.authenticateEmulatorToken = authenticateEmulatorToken;
})(EmulatorValidation = exports.EmulatorValidation || (exports.EmulatorValidation = {}));
//# sourceMappingURL=emulatorValidation.js.map