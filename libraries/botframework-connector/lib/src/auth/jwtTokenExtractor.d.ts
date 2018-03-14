/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as jwt from 'jsonwebtoken';
export declare class JwtTokenExtractor {
    private static openIdMetadataCache;
    readonly: any;
    jwt: any;
    VerifyOptions: any;
    readonly: any;
    OpenIdMetadata: any;
    readonly: any;
    EndorsementsValidator: any;
    constructor(tokenValidationParameters: jwt.VerifyOptions, metadataUrl: string, allowedSigningAlgorithms: string[], validator?: EndorsementsValidator);
    async: any;
    Promise<ClaimsIdentity>(): any;
}
/**
 * The endorsements validator delegate.
 * @param  {string[]} endorments The endorsements used for validation.
 * @returns {boolean} true if validation passes; false otherwise.
 */
export declare type EndorsementsValidator = (endorments: string[]) => boolean;
