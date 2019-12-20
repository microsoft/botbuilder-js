/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// get global fetch
const nodeFetch = require('node-fetch');

export default function getFetch() {    
    const env = (global || window) as any;

    if (!env.hasOwnProperty('fetch')) {    
        return nodeFetch;
    }
    else {        
        return env.fetch;
    }
}
