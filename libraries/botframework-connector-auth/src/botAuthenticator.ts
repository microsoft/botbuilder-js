/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as jwt from 'jsonwebtoken';
import { OpenIdMetadata } from './openIdMetadata';
import { AuthSettings, BotAuthenticatorSettings } from './settings';

var logger = console;

export interface Headers {
    [name: string]: string;
}

export class BotAuthenticator {

    private botConnectorOpenIdMetadata: OpenIdMetadata;
    private msaOpenIdMetadata: OpenIdMetadata;
    private emulatorOpenIdMetadata: OpenIdMetadata;

    constructor(protected settings: BotAuthenticatorSettings = {}) {
        if (!this.settings.endpoint) {

            let settingsOverride: any = {};
            if (this.settings.openIdMetadata !== undefined) {
                settingsOverride.botConnectorOpenIdMetadata = this.settings.openIdMetadata;
            }

            if (this.settings.appId !== undefined) {
                settingsOverride.botConnectorAudience = this.settings.appId;
                settingsOverride.emulatorAudience = this.settings.appId;
            }

            this.settings.endpoint = { ...AuthSettings, ...settingsOverride };
        }

        this.botConnectorOpenIdMetadata = new OpenIdMetadata(this.settings.endpoint.botConnectorOpenIdMetadata);
        this.emulatorOpenIdMetadata = new OpenIdMetadata(this.settings.endpoint.emulatorOpenIdMetadata);
    }

    public authenticate(headers: Headers, channelId?: string, serviceUrl?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            var token: string;
            var isEmulator = channelId === 'emulator';
            var authHeaderValue = headers['authorization'] || headers['Authorization'] || null;
            if (authHeaderValue) {
                var auth = authHeaderValue.trim().split(' ');
                if (auth.length == 2 && auth[0].toLowerCase() == 'bearer') {
                    token = auth[1];
                }
            }

            // Verify token
            if (token) {
                let decoded: any = jwt.decode(token, { complete: true });
                var verifyOptions: jwt.VerifyOptions;
                var openIdMetadata: OpenIdMetadata;
                const algorithms: string[] = ['RS256', 'RS384', 'RS512'];

                if (isEmulator) {
                    
                    // validate the claims from the emulator
                    if ((decoded.payload.ver === '2.0' && decoded.payload.azp !== this.settings.appId) ||
                        (decoded.payload.ver !== '2.0' && decoded.payload.appid !== this.settings.appId)) {
                        var err = new Error('ChatConnector: receive - invalid token. Requested by unexpected app ID.')
                        logger.error(err.message);
                        reject(this.addStatusToError(err, 403));
                    }
    
                    // the token came from the emulator, so ensure the correct issuer is used
                    let issuer: string;
                    if (decoded.payload.ver === '1.0' && decoded.payload.iss == this.settings.endpoint.emulatorAuthV31IssuerV1) {
                        // This token came from the emulator as a v1 token using the Auth v3.1 issuer
                        issuer = this.settings.endpoint.emulatorAuthV31IssuerV1;
                    } else if (decoded.payload.ver === '2.0' && decoded.payload.iss == this.settings.endpoint.emulatorAuthV31IssuerV2) {
                        // This token came from the emulator as a v2 token using the Auth v3.1 issuer
                        issuer = this.settings.endpoint.emulatorAuthV31IssuerV2;
                    } else if (decoded.payload.ver === '1.0' && decoded.payload.iss == this.settings.endpoint.emulatorAuthV32IssuerV1) {
                        // This token came from the emulator as a v1 token using the Auth v3.2 issuer
                        issuer = this.settings.endpoint.emulatorAuthV32IssuerV1;
                    } else if (decoded.payload.ver === '2.0' && decoded.payload.iss == this.settings.endpoint.emulatorAuthV32IssuerV2) {
                        // This token came from the emulator as a v2 token using the Auth v3.2 issuer
                        issuer = this.settings.endpoint.emulatorAuthV32IssuerV2;
                    }
    
                    if (issuer) {
                        openIdMetadata = this.emulatorOpenIdMetadata;
                        verifyOptions = {
                            algorithms: algorithms,
                            issuer: issuer,
                            audience: this.settings.endpoint.emulatorAudience,
                            clockTolerance: 300
                        };
                    }
                }
    
                if (!verifyOptions) {
                    // This is a normal token, so use our Bot Connector verification
                    openIdMetadata = this.botConnectorOpenIdMetadata;
                    verifyOptions = {
                        issuer: this.settings.endpoint.botConnectorIssuer,
                        audience: this.settings.endpoint.botConnectorAudience,
                        clockTolerance: 300
                    };
                }

                openIdMetadata.getKey(decoded.header.kid, key => {
                    if (key) {
                        try {
                            jwt.verify(token, key.key, verifyOptions);

                            // enforce endorsements in openIdMetadadata if there is any endorsements associated with the key
                            if (typeof channelId !== 'undefined' &&
                                typeof key.endorsements !== 'undefined' &&
                                key.endorsements.lastIndexOf(channelId) === -1) {
                                const errorDescription: string = `channelId in req.body: ${channelId} didn't match the endorsements: ${key.endorsements.join(',')}.`;
                                logger.error(`BotAuthenticator: receive - endorsements validation failure. ${errorDescription}`);
                                reject(this.addStatusToError(new Error(errorDescription), 403));
                            }

                            // validate service url using token's serviceurl payload
                            if (typeof decoded.payload.serviceurl !== 'undefined' &&
                                typeof serviceUrl !== 'undefined' &&
                                decoded.payload.serviceurl !== serviceUrl) {
                                const errorDescription: string = `ServiceUrl in payload of token: ${decoded.payload.serviceurl} didn't match the request's serviceurl: ${serviceUrl}.`;
                                logger.error(`BotAuthenticator: receive - serviceurl mismatch. ${errorDescription}`);
                                reject(this.addStatusToError(new Error(errorDescription), 403));
                            }
                        } catch (err) {
                            logger.error('BotAuthenticator: receive - invalid token. Check bot\'s app ID & Password.');
                            reject(this.addStatusToError(err, 403));
                        }

                        resolve();
                    } else {
                        var err = new Error('BotAuthenticator: receive - invalid signing key or OpenId metadata document.');
                        logger.error(err.message);
                        reject(this.addStatusToError(err, 500));
                    }
                });
            } else if (isEmulator && !this.settings.appId && !this.settings.appPassword) {
                // Emulator running without auth enabled
                logger.warn('BotAuthenticator: receive - emulator running without security enabled.');
                resolve();
            } else {
                // Token not provided so
                var err = new Error('BotAuthenticator: receive - no security token sent.');
                logger.error(err.message);
                reject(this.addStatusToError(err, 401));
            }
            resolve();
        });
    }

    private addStatusToError(err: Error, status: number): Error {
        (err as any).status = status;
        return err;
    }
}