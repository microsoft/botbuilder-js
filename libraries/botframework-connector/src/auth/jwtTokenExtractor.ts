/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as jwt from 'jsonwebtoken';
import { Claim,  ClaimsIdentity } from './claimsIdentity';
import { Constants } from './constants';
import { EndorsementsValidator } from './endorsementsValidator';
import { OpenIdMetadata } from './openIdMetadata';

export class JwtTokenExtractor {

    // Cache for OpenIdConnect configuration managers (one per metadata URL)
    private static openIdMetadataCache: Map<string, OpenIdMetadata> = new Map<string, OpenIdMetadata>();

    // Token validation parameters for this instance
    public readonly tokenValidationParameters: jwt.VerifyOptions;

    // OpenIdMetadata for this instance
    public readonly openIdMetadata: OpenIdMetadata;

    constructor(tokenValidationParameters: jwt.VerifyOptions, metadataUrl: string, allowedSigningAlgorithms: string[]) {
        this.tokenValidationParameters = { ...tokenValidationParameters };
        this.tokenValidationParameters.algorithms = allowedSigningAlgorithms;
        this.openIdMetadata = JwtTokenExtractor.getOrAddOpenIdMetadata(metadataUrl);
    }

    private static getOrAddOpenIdMetadata(metadataUrl: string): OpenIdMetadata {
        let metadata: OpenIdMetadata = JwtTokenExtractor.openIdMetadataCache.get(metadataUrl);
        if (!metadata) {
            metadata = new OpenIdMetadata(metadataUrl);
            JwtTokenExtractor.openIdMetadataCache.set(metadataUrl, metadata);
        }

        return metadata;
    }

    public async getIdentityFromAuthHeader(authorizationHeader: string, channelId: string): Promise<ClaimsIdentity | null> {
        if (!authorizationHeader) {
            return null;
        }

        const parts: string[] = authorizationHeader.split(' ');
        if (parts.length === 2) {
            return await this.getIdentity(parts[0], parts[1], channelId);
        }

        return null;
    }

    public async getIdentity(scheme: string, parameter: string, channelId: string): Promise<ClaimsIdentity | null> {
        // No header in correct scheme or no token
        if (scheme !== 'Bearer' || !parameter) {
            return null;
        }

        // Issuer isn't allowed? No need to check signature
        if (!this.hasAllowedIssuer(parameter)) {
            return null;
        }

        try {
            return await this.validateToken(parameter, channelId);
        } catch (err) {
            console.log('JwtTokenExtractor.getIdentity:err!', err);
            throw err;
        }
    }

    private hasAllowedIssuer(jwtToken: string): boolean {
        const decoded: any = <any>jwt.decode(jwtToken, { complete: true });
        const issuer: string = decoded.payload.iss;

        if (Array.isArray(this.tokenValidationParameters.issuer)) {
            return this.tokenValidationParameters.issuer.indexOf(issuer) !== -1;
        }

        if (typeof this.tokenValidationParameters.issuer === 'string') {
            return this.tokenValidationParameters.issuer === issuer;
        }

        return false;
    }

    private async validateToken(jwtToken: string, channelId: string): Promise<ClaimsIdentity> {

        const decodedToken: any = <any>jwt.decode(jwtToken, { complete: true });

        // Update the signing tokens from the last refresh
        const keyId: string = decodedToken.header.kid;
        const metadata: any = await this.openIdMetadata.getKey(keyId);
        if (!metadata) {
            throw new Error('Signing Key could not be retrieved.');
        }

        try {
            const decodedPayload: any = <any>jwt.verify(jwtToken, metadata.key, this.tokenValidationParameters);

            // enforce endorsements in openIdMetadadata if there is any endorsements associated with the key
            const endorsements: any = metadata.endorsements;

            if (Array.isArray(endorsements) && endorsements.length !== 0) {
                const isEndorsed: boolean = EndorsementsValidator.validate(channelId, endorsements);
                if (!isEndorsed) {
                    throw new Error(`Could not validate endorsement for key: ${keyId} with endorsements: ${endorsements.join(',')}`);
                }
            }

            if (this.tokenValidationParameters.algorithms) {
                if (this.tokenValidationParameters.algorithms.indexOf(decodedToken.header.alg) === -1) {
                    throw new Error(`"Token signing algorithm '${decodedToken.header.alg}' not in allowed list`);
                }
            }

            const claims: Claim[] = Object.keys(decodedPayload).reduce(
                (acc: any, key: any) => {
                    acc.push({ type: key, value: decodedPayload[key] });

                    return acc;
                },
                <Claim[]>[]
            );

            return new ClaimsIdentity(claims, true);

        } catch (err) {
            console.log(`Error finding key for token. Available keys: ${metadata.key}`);
            throw err;
        }
    }
}
