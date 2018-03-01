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
 * Storage provider that uses browser local storage.
 *
 * | package | middleware |
 * | ------- | :--------: |
 * | botbuilder-core-extensions | no |
 */
class BrowserLocalStorage extends memoryStorage_1.MemoryStorage {
    constructor() {
        super(localStorage);
    }
}
exports.BrowserLocalStorage = BrowserLocalStorage;
/**
 * Storage provider that uses browser session storage.
 *
 * | package | middleware |
 * | ------- | :--------: |
 * | botbuilder-core-extensions | no |
 */
class BrowserSessionStorage extends memoryStorage_1.MemoryStorage {
    constructor() {
        super(sessionStorage);
    }
}
exports.BrowserSessionStorage = BrowserSessionStorage;
//# sourceMappingURL=browserStorage.js.map