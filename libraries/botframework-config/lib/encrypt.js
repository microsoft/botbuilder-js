"use strict";
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
/**
 * Encrypt a string using standardized encyryption of AES256 with
 *      key = SHA256 hash of UTF8 secret
 *      iv = optional 16 bytes of iv string
 * @param value value to encrypt
 * @param secret secret to use
 * @param iv optional salt to value to make unique. Only needed if value could be the same
 */
function encryptString(value, secret, iv) {
    // standardized encyryption is AES256 using
    //    key = SHA256 hash of UTF8 secret
    //    iv = optional 16 bytes of iv string
    if (!value || value.length == 0)
        throw new Error('you must pass a value');
    if (!secret || value.length == 0)
        throw new Error('you must pass a secret');
    let secretKey = crypto.createHash('sha256').update(secret, "utf8").digest();
    let ivKey = Buffer.from(((iv || '').toLowerCase() + '                ').substr(0, 16), "utf8");
    let cipher = crypto.createCipheriv('aes256', secretKey, ivKey);
    let encryptedValue = cipher.update(value, 'utf8', 'base64');
    encryptedValue += cipher.final('base64');
    return encryptedValue;
}
exports.encryptString = encryptString;
/**
 *  Decrypt a string using standardized encyryption of AES256 with
 *      key = SHA256 hash of UTF8 secret
 *      iv = optional 16 bytes of iv string
 * @param enryptedValue value to decrypt
 * @param secret secret to use
 * @param iv optional salt to value to make unique. Only needed if value could be the same
 */
function decryptString(encryptedValue, secret, iv) {
    if (!encryptedValue || encryptedValue.length == 0)
        throw new Error('you must pass a encryptedValue');
    if (!secret || secret.length == 0)
        throw new Error('you must pass a secret');
    let secretKey = crypto.createHash('sha256').update(secret || '', "utf8").digest();
    let ivKey = Buffer.from(((iv || '').toLowerCase() + '                ').substr(0, 16), "utf8");
    let decipher = crypto.createDecipheriv('aes256', secretKey, ivKey);
    let value = decipher.update(encryptedValue, 'base64', 'utf8');
    value += decipher.final('utf8');
    return value;
}
exports.decryptString = decryptString;
//# sourceMappingURL=encrypt.js.map