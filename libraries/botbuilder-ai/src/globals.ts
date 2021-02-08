/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const window = require('./custom.window');

/**
 * Gets the fetch library.
 *
 * @returns {any} The fetch library.
 */
export function getFetch() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env: Record<'fetch', any> = global ?? window;

    if (!Object.hasOwnProperty.call(env, 'fetch')) {
        env.fetch = require('node-fetch');
    }

    return env.fetch;
}
