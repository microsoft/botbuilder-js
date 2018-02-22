/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as jwt from 'jsonwebtoken';
import { ICredentialProvider } from './credentialProvider';
import { ClaimsIdentity } from './claimsIdentity';
/**
 * Validates and Examines JWT tokens from the Bot Framework Emulator
 */
export declare module EmulatorValidation {
    /**
     * TO BOT FROM EMULATOR: Token validation parameters when connecting to a channel.
     */
    const ToBotFromEmulatorTokenValidationParameters: jwt.VerifyOptions;
    /**
     * Determines if a given Auth header is from the Bot Framework Emulator
     * @param  {string} authHeader Bearer Token, in the "Bearer [Long String]" Format.
     * @returns {boolean} True, if the token was issued by the Emulator. Otherwise, false.
     */
    function isTokenFromEmulator(authHeader: string): boolean;
    /**
     * Validate the incoming Auth Header as a token sent from the Bot Framework Emulator.
     * A token issued by the Bot Framework will FAIL this check. Only Emulator tokens will pass.
     * @param  {string} authHeader The raw HTTP header in the format: "Bearer [longString]"
     * @param  {ICredentialProvider} credentials The user defined set of valid credentials, such as the AppId.
     * @returns {Promise<ClaimsIdentity>} A valid ClaimsIdentity.
     */
    function authenticateEmulatorToken(authHeader: string, credentials: ICredentialProvider): Promise<ClaimsIdentity>;
}
