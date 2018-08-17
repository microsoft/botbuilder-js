/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

import * as crypto from 'crypto';

export function generateKey(): string {
    return crypto.randomBytes(32).toString('base64');
}

/**
 * Encrypt a string using standardized encyryption of AES256 
 * @param value value to encrypt
 * @param key secret to use
 */
export function encryptString(value: string, key: string): string {
    if (!value || value.length == 0)
        throw new Error('you must pass a value');

    if (!key || value.length == 0)
        throw new Error('you must pass a key');

    let keyBytes = new Buffer(key, 'base64');
    let ivKey = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv('aes256', keyBytes, ivKey);
    let encryptedValue = cipher.update(value, 'utf8', 'base64');
    encryptedValue += cipher.final('base64');
    return `${ivKey.toString('base64')}!${encryptedValue}`;
}

/**
 *  Decrypt a string using standardized encyryption of AES256 with
 *      key = SHA256 hash of UTF8 secret
 *      iv = optional 16 bytes of iv string
 * @param enryptedValue value to decrypt
 * @param key secret to use
 */
export function decryptString(encryptedValue: string, key: string): string {
    if (!encryptedValue || encryptedValue.length == 0)
        throw new Error('you must pass a encryptedValue');

    if (!key || key.length == 0)
        throw new Error('you must pass a secret');

    let parts = encryptedValue.split('!');
    if (parts.length != 2)
        throw new Error("The enrypted value is not a valid format");

    let ivBytes = new Buffer(parts[0], 'base64');
    let keyBytes = new Buffer(key, 'base64');
    let decipher = crypto.createDecipheriv('aes256', keyBytes, ivBytes);
    let value = decipher.update(parts[1], 'base64', 'utf8');
    value += decipher.final('utf8');
    return value;
}
