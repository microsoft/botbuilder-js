"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder-storage
 */
/** second comment block */
const memoryStorage_1 = require("./memoryStorage");
/**
 * Storage middleware that uses browser local storage.
 */
class BrowserLocalStorage extends memoryStorage_1.MemoryStorage {
    constructor() {
        super(localStorage);
    }
}
exports.BrowserLocalStorage = BrowserLocalStorage;
/**
 * Storage middleware that uses browser session storage.
 */
class BrowserSessionStorage extends memoryStorage_1.MemoryStorage {
    constructor() {
        super(sessionStorage);
    }
}
exports.BrowserSessionStorage = BrowserSessionStorage;
//# sourceMappingURL=browserStorage.js.map