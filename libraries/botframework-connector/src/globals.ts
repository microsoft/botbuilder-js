/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// set FormData and Fetch as global functions
function setGlobals() {
    const env = (global || window) as any;
    
    if (!env.hasOwnProperty("FormData")) { 
        env.FormData = require("form-data");
    }

    if (!env.hasOwnProperty("fetch")) {
        env.fetch = require("node-fetch");
    }
}

setGlobals();
