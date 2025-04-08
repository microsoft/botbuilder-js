/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable no-undef */

/**
 * Replacement for the getRandomValues function in the crypto module.
 *
 * @param {} array Array to fill with random values.
 * @returns A reference to the array passed in as an argument, filled with random values.
 */
export function getRandomValues(array) {
    return window.crypto.getRandomValues(array);
}

/**
 * Replacement for the createHash function in the crypto module.
 *
 * @param {*} algorithm The algorithm to use for hashing.
 * @returns A hash that can be used to generate hash digests using the given algorithm
 */
export function createHash(algorithm) {
    if (algorithm !== 'sha256') {
        throw new Error(`Unsupported hash algorithm: ${algorithm}`);
    }

    return {
        _data: [],
        update(data) {
            if (typeof data === 'string') {
                this._data.push(new TextEncoder().encode(data));
            } else if (data instanceof Uint8Array) {
                this._data.push(data);
            } else {
                throw new Error('Unsupported data type for hashing');
            }
            return this;
        },
        async digest() {
            const concatenated = new Uint8Array(this._data.reduce((acc, curr) => acc + curr.length, 0));
            let offset = 0;
            for (const chunk of this._data) {
                concatenated.set(chunk, offset);
                offset += chunk.length;
            }
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', concatenated);
            return new Uint8Array(hashBuffer);
        },
    };
}

export default {
    ...window.crypto,
    createHash,
    getRandomValues,
};
