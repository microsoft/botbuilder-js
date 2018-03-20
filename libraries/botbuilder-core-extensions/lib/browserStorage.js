"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const memoryStorage_1 = require("./memoryStorage");
/**
 * :package: **botbuilder-core-extensions**
 *
 * Storage provider that uses browser local storage.
 */
class BrowserLocalStorage extends memoryStorage_1.MemoryStorage {
    constructor() {
        super(localStorage);
    }
}
exports.BrowserLocalStorage = BrowserLocalStorage;
/**
 * :package: **botbuilder-core-extensions**
 *
 * Storage provider that uses browser session storage.
 */
class BrowserSessionStorage extends memoryStorage_1.MemoryStorage {
    constructor() {
        super(sessionStorage);
    }
}
exports.BrowserSessionStorage = BrowserSessionStorage;
//# sourceMappingURL=browserStorage.js.map