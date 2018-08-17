/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
export declare function generateKey(): string;
/**
 * Encrypt a string using standardized encyryption of AES256
 * @param value value to encrypt
 * @param key secret to use
 */
export declare function encryptString(value: string, key: string): string;
/**
 *  Decrypt a string using standardized encyryption of AES256 with
 *      key = SHA256 hash of UTF8 secret
 *      iv = optional 16 bytes of iv string
 * @param enryptedValue value to decrypt
 * @param key secret to use
 */
export declare function decryptString(encryptedValue: string, key: string): string;
