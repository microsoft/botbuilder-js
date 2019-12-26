/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// set FormData and Fetch as global functions
(function() {
    if (!this.hasOwnProperty("FormData")) { 
        this.FormData = require("form-data");
    }

    if (!this.hasOwnProperty("fetch")) {
        this.fetch = require("node-fetch");
    }
})();
