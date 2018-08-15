/**
 * Encrypt a string using standardized encyryption of AES256 with
 *      key = SHA256 hash of UTF8 secret
 *      iv = optional 16 bytes of iv string
 * @param value value to encrypt
 * @param secret secret to use
 * @param iv optional salt to value to make unique. Only needed if value could be the same
 */
export declare function encryptString(value: string, secret: string, iv?: string): string;
/**
 *  Decrypt a string using standardized encyryption of AES256 with
 *      key = SHA256 hash of UTF8 secret
 *      iv = optional 16 bytes of iv string
 * @param enryptedValue value to decrypt
 * @param secret secret to use
 * @param iv optional salt to value to make unique. Only needed if value could be the same
 */
export declare function decryptString(encryptedValue: string, secret: string, iv?: string): string;
