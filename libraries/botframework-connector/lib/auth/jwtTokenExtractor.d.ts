/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as jwt from 'jsonwebtoken';
import { ClaimsIdentity } from "./claimsIdentity";
import { OpenIdMetadata } from './openIdMetadata';
export declare class JwtTokenExtractor {
    private static openIdMetadataCache;
    readonly tokenValidationParameters: jwt.VerifyOptions;
    readonly openIdMetadata: OpenIdMetadata;
    readonly validator: EndorsementsValidator;
    constructor(tokenValidationParameters: jwt.VerifyOptions, metadataUrl: string, allowedSigningAlgorithms: string[], validator?: EndorsementsValidator);
    getIdentityFromAuthHeader(authorizationHeader: string): Promise<ClaimsIdentity | null>;
    getIdentity(scheme: string, parameter: string): Promise<ClaimsIdentity | null>;
    private hasAllowedIssuer(jwtToken);
    private validateToken(jwtToken);
    private static getOrAddOpenIdMetadata(metadataUrl);
}
/**
 * The endorsements validator delegate.
 * @param  {string[]} endorments The endorsements used for validation.
 * @returns {boolean} true if validation passes; false otherwise.
 */
export declare type EndorsementsValidator = (endorments: string[]) => boolean;
