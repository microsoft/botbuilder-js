"use strict";
/**
 * @module botbuilder-schema
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./constants"));
// export models for JS
(function (m) {
    for (var p in m)
        if (!exports.hasOwnProperty(p))
            exports[p] = m[p];
})(require("./generated/models"));
