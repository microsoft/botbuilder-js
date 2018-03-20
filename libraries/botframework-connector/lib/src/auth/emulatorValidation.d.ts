/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as jwt from 'jsonwebtoken';
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
}
