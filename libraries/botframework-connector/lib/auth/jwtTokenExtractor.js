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
const claimsIdentity_1 = require("./claimsIdentity");
const openIdMetadata_1 = require("./openIdMetadata");
class JwtTokenExtractor {
    constructor(tokenValidationParameters, metadataUrl, allowedSigningAlgorithms, validator = (endorments) => true) {
        this.tokenValidationParameters = Object.assign({}, tokenValidationParameters);
        this.tokenValidationParameters.algorithms = allowedSigningAlgorithms;
        this.openIdMetadata = JwtTokenExtractor.getOrAddOpenIdMetadata(metadataUrl);
        this.validator = validator;
    }
    getIdentityFromAuthHeader(authorizationHeader) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!authorizationHeader) {
                return null;
            }
            let parts = authorizationHeader.split(' ');
            if (parts.length == 2) {
                return yield this.getIdentity(parts[0], parts[1]);
            }
            return null;
        });
    }
    getIdentity(scheme, parameter) {
        return __awaiter(this, void 0, void 0, function* () {
            // No header in correct scheme or no token
            if (scheme !== "Bearer" || !parameter) {
                return null;
            }
            // Issuer isn't allowed? No need to check signature
            if (!this.hasAllowedIssuer(parameter)) {
                return null;
            }
            try {
                return yield this.validateToken(parameter);
            }
            catch (err) {
                console.log('JwtTokenExtractor.getIdentity:err!', err);
                throw err;
            }
        });
    }
    hasAllowedIssuer(jwtToken) {
        let decoded = jwt.decode(jwtToken, { complete: true });
        let issuer = decoded.payload.iss;
        if (Array.isArray(this.tokenValidationParameters.issuer)) {
            return this.tokenValidationParameters.issuer.indexOf(issuer) != -1;
        }
        if (typeof this.tokenValidationParameters.issuer === "string") {
            return this.tokenValidationParameters.issuer === issuer;
        }
        return false;
    }
    validateToken(jwtToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let decodedToken = jwt.decode(jwtToken, { complete: true });
            // Update the signing tokens from the last refresh
            let keyId = decodedToken.header.kid;
            let metadata = yield this.openIdMetadata.getKey(keyId);
            if (!metadata) {
                throw new Error('Signing Key could not be retrieved.');
            }
            try {
                let decodedPayload = jwt.verify(jwtToken, metadata.key, this.tokenValidationParameters);
                // enforce endorsements in openIdMetadadata if there is any endorsements associated with the key
                let endorments = metadata.endorsements;
                if (Array.isArray(metadata.endorsements) && !this.validator(metadata.endorsements)) {
                    throw new Error(`Could not validate endorsement for key: ${keyId} with endorsements: ${metadata.endorsements.join(',')}`);
                }
                if (this.tokenValidationParameters.algorithms) {
                    if (this.tokenValidationParameters.algorithms.indexOf(decodedToken.header.alg) === -1) {
                        throw new Error(`"Token signing algorithm '${decodedToken.header.alg}' not in allowed list`);
                    }
                }
                let claims = Object.keys(decodedPayload).reduce(function (acc, key) {
                    acc.push({ type: key, value: decodedPayload[key] });
                    return acc;
                }, []);
                return new claimsIdentity_1.ClaimsIdentity(claims, true);
            }
            catch (err) {
                console.log("Error finding key for token. Available keys: " + metadata.key);
                throw err;
            }
        });
    }
    static getOrAddOpenIdMetadata(metadataUrl) {
        let metadata = JwtTokenExtractor.openIdMetadataCache.get(metadataUrl);
        if (!metadata) {
            metadata = new openIdMetadata_1.OpenIdMetadata(metadataUrl);
            JwtTokenExtractor.openIdMetadataCache.set(metadataUrl, metadata);
        }
        return metadata;
    }
}
// Cache for OpenIdConnect configuration managers (one per metadata URL)
JwtTokenExtractor.openIdMetadataCache = new Map();
exports.JwtTokenExtractor = JwtTokenExtractor;
//# sourceMappingURL=jwtTokenExtractor.js.map