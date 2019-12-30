/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export function getFetch() {    
    const env = (global || window) as any;

    if (!env.hasOwnProperty('fetch')) {    
        env.fetch = require('node-fetch');
        return env.fetch;
    }
    else {              
        return env.fetch;
    }
}
