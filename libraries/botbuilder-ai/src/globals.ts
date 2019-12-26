/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const nodeFetch = require('node-fetch');

export function getFetch() {    
    const env = (global || window) as any;

    if (!env.hasOwnProperty('fetch')) {    
        env.fetch = nodeFetch;
        return env.fetch;
    }
    else {              
        return env.fetch;
    }
}
