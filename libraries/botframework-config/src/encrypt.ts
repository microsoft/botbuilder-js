/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

import * as crypto from 'crypto';

/**
 * Encrypt a string using standardized encyryption of AES256 with
 *      key = SHA256 hash of UTF8 secret
 *      iv = optional 16 bytes of iv string
 * @param value value to encrypt
 * @param secret secret to use
 * @param iv optional salt to value to make unique. Only needed if value could be the same 
 */
export function encryptString(value: string, secret: string, iv?: string): string {
    // standardized encyryption is AES256 using
    //    key = SHA256 hash of UTF8 secret
    //    iv = optional 16 bytes of iv string
    if (!value)
        throw new Error('you must pass a value');
    if (!secret)
        throw new Error('you must pass a secret');
    let secretKey = crypto.createHash('sha256').update(secret, "utf8").digest();
    let ivKey = Buffer.from(((iv || '').toLowerCase() + '                ').substr(0, 16), "utf8");
    let cipher = crypto.createCipheriv('aes256', secretKey, ivKey);
    let encryptedValue = cipher.update(value, 'utf8', 'base64');
    encryptedValue += cipher.final('base64');
    return encryptedValue;
}

/**
 *  Decrypt a string using standardized encyryption of AES256 with
 *      key = SHA256 hash of UTF8 secret
 *      iv = optional 16 bytes of iv string
 * @param enryptedValue value to decrypt
 * @param secret secret to use
 * @param iv optional salt to value to make unique. Only needed if value could be the same
 */
export function decryptString(encryptedValue: string, secret: string, iv?: string): string {
    if (!encryptedValue)
        throw new Error('you must pass a encryptedValue');
    if (!secret)
        throw new Error('you must pass a secret');
    let secretKey = crypto.createHash('sha256').update(secret || '', "utf8").digest();
    let ivKey = Buffer.from(((iv || '').toLowerCase() + '                ').substr(0, 16), "utf8");
    let decipher = crypto.createDecipheriv('aes256', secretKey, ivKey);
    let value = decipher.update(encryptedValue, 'base64', 'utf8');
    value += decipher.final('utf8');
    return value;
}
