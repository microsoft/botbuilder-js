/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// set FormData and Fetch as global functions
function setGlobals() {
    if (!this.hasOwnProperty("FormData")) {
        console.log('setting FormData as global function');
        this.FormData = require("form-data");
    }
    if (!this.hasOwnProperty("fetch")) {
        console.log('setting fetch as global function');
        this.fetch = require("node-fetch");
    }
}

setGlobals();
