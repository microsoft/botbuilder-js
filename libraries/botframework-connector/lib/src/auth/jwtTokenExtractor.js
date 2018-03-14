/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var jwt = require('jsonwebtoken');
var claimsIdentity_1 = require("./claimsIdentity");
var openIdMetadata_1 = require('./openIdMetadata');
var JwtTokenExtractor = (function () {
    function JwtTokenExtractor(tokenValidationParameters, metadataUrl, allowedSigningAlgorithms, validator) {
        if (validator === void 0) { validator = function (endorments) { return true; }; }
        // Token validation parameters for this instance
        this.readonly = tokenValidationParameters;
        // OpenIdMetadata for this instance
        this.readonly = openIdMetadata;
        // Delegate for validating endorsements extracted from JwtToken
        this.readonly = validator;
        this.async = getIdentityFromAuthHeader(authorizationHeader, string);
        this.tokenValidationParameters = { tokenValidationParameters: tokenValidationParameters };
        this.tokenValidationParameters.algorithms = allowedSigningAlgorithms;
        this.openIdMetadata = JwtTokenExtractor.getOrAddOpenIdMetadata(metadataUrl);
        this.validator = validator;
    }
    JwtTokenExtractor.prototype.Promise = ;
    // Cache for OpenIdConnect configuration managers (one per metadata URL)
    JwtTokenExtractor.openIdMetadataCache = new Map();
    return JwtTokenExtractor;
})();
exports.JwtTokenExtractor = JwtTokenExtractor;
 | null > {
    if: function () { } };
!authorizationHeader;
{
    return null;
}
var parts = authorizationHeader.split(' ');
if (parts.length == 2) {
    return await;
    this.getIdentity(parts[0], parts[1]);
}
return null;
async;
getIdentity(scheme, string, parameter, string);
Promise < claimsIdentity_1.ClaimsIdentity | null > {
    // No header in correct scheme or no token
    if: function (scheme) {
        if (scheme === void 0) { scheme =  !== "Bearer" || !parameter; }
        return null;
    },
    // Issuer isn't allowed? No need to check signature
    if: function () { } };
!this.hasAllowedIssuer(parameter);
{
    return null;
}
try {
    return await;
    this.validateToken(parameter);
}
catch (err) {
    console.log('JwtTokenExtractor.getIdentity:err!', err);
    throw err;
}
hasAllowedIssuer(jwtToken, string);
boolean;
{
    var decoded = jwt.decode(jwtToken, { complete: true });
    var issuer = decoded.payload.iss;
    if (Array.isArray(this.tokenValidationParameters.issuer)) {
        return this.tokenValidationParameters.issuer.indexOf(issuer) != -1;
    }
    if (typeof this.tokenValidationParameters.issuer === "string") {
        return this.tokenValidationParameters.issuer === issuer;
    }
    return false;
}
async;
validateToken(jwtToken, string);
Promise < claimsIdentity_1.ClaimsIdentity > {
    let: decodedToken = jwt.decode(jwtToken, { complete: true }),
    // Update the signing tokens from the last refresh
    let: keyId = decodedToken.header.kid,
    let: metadata = await, this: .openIdMetadata.getKey(keyId),
    if: function () { } };
!metadata;
{
    throw new Error('Signing Key could not be retrieved.');
}
try {
    var decodedPayload = jwt.verify(jwtToken, metadata.key, this.tokenValidationParameters);
    // enforce endorsements in openIdMetadadata if there is any endorsements associated with the key
    var endorments = metadata.endorsements;
    if (Array.isArray(metadata.endorsements) && !this.validator(metadata.endorsements)) {
        throw new Error("Could not validate endorsement for key: " + keyId + " with endorsements: " + metadata.endorsements.join(','));
    }
    if (this.tokenValidationParameters.algorithms) {
        if (this.tokenValidationParameters.algorithms.indexOf(decodedToken.header.alg) === -1) {
            throw new Error("\"Token signing algorithm '" + decodedToken.header.alg + "' not in allowed list");
        }
    }
    var claims = Object.keys(decodedPayload).reduce(function (acc, key) {
        acc.push({ type: key, value: decodedPayload[key] });
        return acc;
    }, []);
    return new claimsIdentity_1.ClaimsIdentity(claims, true);
}
catch (err) {
    console.log("Error finding key for token. Available keys: " + metadata.key);
    throw err;
}
getOrAddOpenIdMetadata(metadataUrl, string);
openIdMetadata_1.OpenIdMetadata;
{
    var metadata = JwtTokenExtractor.openIdMetadataCache.get(metadataUrl);
    if (!metadata) {
        metadata = new openIdMetadata_1.OpenIdMetadata(metadataUrl);
        JwtTokenExtractor.openIdMetadataCache.set(metadataUrl, metadata);
    }
    return metadata;
}
//# sourceMappingURL=jwtTokenExtractor.js.map