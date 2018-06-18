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
    constructor(tokenValidationParameters: jwt.VerifyOptions, metadataUrl: string, allowedSigningAlgorithms: string[]);
    getIdentityFromAuthHeader(authorizationHeader: string, channelId: string): Promise<ClaimsIdentity | null>;
    getIdentity(scheme: string, parameter: string, channelId: string): Promise<ClaimsIdentity | null>;
    private hasAllowedIssuer(jwtToken);
    private validateToken(jwtToken, channelId);
    private static getOrAddOpenIdMetadata(metadataUrl);
}
