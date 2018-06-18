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
 * @remarks
 * Anything written to the store will remain persisted until the user manually flushes their
 * browsers cookies and other site data.
 *
 * ```JavaScript
 * const { BrowserLocalStorage, UserState } = require('botbuilder');
 *
 * const userState = new UserState(new BrowserLocalStorage());
 * ```
 */
class BrowserLocalStorage extends memoryStorage_1.MemoryStorage {
    /** Creates a new BrowserLocalStorage instance. */
    constructor() {
        super(localStorage);
    }
}
exports.BrowserLocalStorage = BrowserLocalStorage;
/**
 * Storage provider that uses browser session storage.
 *
 * @remarks
 * Anything written to the store will only be persisted for the lifetime of a single page within a
 * browser tab. The storage will survive page reloads but closing the tab will delete anything
 * persisted by the store and opening a new browser tab will create a new persistance store for the
 * page.
 *
 * ```JavaScript
 * const { BrowserSessionStorage, ConversationState } = require('botbuilder');
 *
 * const conversationState = new ConversationState(new BrowserSessionStorage());
 * ```
 */
class BrowserSessionStorage extends memoryStorage_1.MemoryStorage {
    /** Creates a new BroserSessionStorage instance. */
    constructor() {
        super(sessionStorage);
    }
}
exports.BrowserSessionStorage = BrowserSessionStorage;
//# sourceMappingURL=browserStorage.js.map