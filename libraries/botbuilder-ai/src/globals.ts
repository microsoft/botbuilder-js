/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const window = require('./custom.window');

/**
 * Gets the fetch library.
 *
 * @returns {any} The fetch library.
 */
export function getFetch() {
    if (global) {
        return (global.fetch = require('node-fetch')); // eslint-disable-line @typescript-eslint/no-require-imports
    }

    return window?.fetch;
}
