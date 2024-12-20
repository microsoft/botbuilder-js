/**
 * @module botframework-config
 *
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

import crypto from 'crypto';
import { version as nodeVersion } from 'process';

/**
 * @private
 * @deprecated
 */
export function generateKey(): string {
    // Generates 32 byte cryptographically strong pseudo-random data as a base64 encoded string
    // https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback
    return crypto.randomBytes(32).toString('base64');
}

/**
 * @private
 * @deprecated
 * Encrypt a string using standardized encyryption of AES256
 * @param plainText value to encrypt
 * @param secret secret to use
 */
export function encryptString(plainText: string, secret: string): string {
    if (!plainText || plainText.length === 0) {
        return plainText;
    }

    if (!secret || secret.length === 0) {
        throw new Error('you must pass a secret');
    }

    const keyBytes: Buffer = Buffer.from(secret, 'base64');

    // Generates 16 byte cryptographically strong pseudo-random data as IV
    // https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback
    const ivBytes: Buffer = crypto.randomBytes(16);
    const ivText: string = ivBytes.toString('base64');

    // encrypt using aes256 iv + key + plainText = encryptedText
    const cipher: crypto.Cipher = crypto.createCipheriv('aes-256-cbc', keyBytes, ivBytes);
    let encryptedValue: string = cipher.update(plainText, 'utf8', 'base64');
    encryptedValue += cipher.final('base64');

    // store base64(ivBytes)!base64(encryptedValue)
    return `${ivText}!${encryptedValue}`;
}

/**
 * @private
 * @deprecated
 * Decrypt a string using standardized encyryption of AES256
 * @param enryptedValue value to decrypt
 * @param secret secret to use
 */
export function decryptString(encryptedValue: string, secret: string): string {
    if (!encryptedValue || encryptedValue.length === 0) {
        return encryptedValue;
    }

    if (!secret || secret.length === 0) {
        throw new Error('you must pass a secret');
    }

    // enrypted value = base64(ivBytes)!base64(encryptedValue)
    const parts: string[] = encryptedValue.split('!');
    if (parts.length !== 2) {
        throw new Error('The encrypted value is not a valid format');
    }

    const ivText: string = parts[0];
    const encryptedText: string = parts[1];

    const ivBytes: Buffer = Buffer.from(ivText, 'base64');
    const keyBytes: Buffer = Buffer.from(secret, 'base64');

    if (ivBytes.length !== 16) {
        throw new Error('The encrypted value is not a valid format');
    }

    if (keyBytes.length !== 32) {
        throw new Error('The secret is not valid format');
    }

    // decrypt using aes256 iv + key + encryptedText = decryptedText
    const decipher: crypto.Decipher = crypto.createDecipheriv('aes-256-cbc', keyBytes, ivBytes);
    let value: string = decipher.update(encryptedText, 'base64', 'utf8');
    value += decipher.final('utf8');

    return value;
}

/**
 * @private
 * @deprecated
 * @param encryptedValue
 * @param secret
 */
export function legacyDecrypt(encryptedValue: string, secret: string): string {
    const UNSUPPORTED_VERSION = 'v22.0.0';
    if (!isNodeCompatible(nodeVersion, UNSUPPORTED_VERSION)) {
        throw new Error(`This method is not available for Node.js versions over ${UNSUPPORTED_VERSION}.`);
    } else {
        // LEGACY for pre standardized SHA256 encryption, this uses some undocumented nodejs MD5 hash internally and is deprecated
        const decipher: crypto.Decipher = crypto.createDecipher('aes192', secret);
        let value: string = decipher.update(encryptedValue, 'hex', 'utf8');
        value += decipher.final('utf8');

        return value;
    }
}

/**
 * private
 *
 * @param currentVersion The current version of Node.js.
 * @param minVersion The minimum unsupported version.
 * @returns true if the current version of Node is lower than the unsupported version.
 */
function isNodeCompatible(currentVersion: string, minVersion: string): boolean {
    return minVersion.localeCompare(currentVersion) > 0;
}
