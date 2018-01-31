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
 * Storage middleware that uses browser local storage.
 *
 * __Extends BotContext:__
 * * context.storage - Storage provider for storing and retrieving objects.
 *
 * **Usage Example**
 *
 * ```js
 * const bot = new Bot(adapter)
 *      .use(new BrowserLocalStorage())
 *      .use(new BotStateManage())
 *      .onReceive((context) => {
 *          context.reply(`Hello World`);
 *      })
 * ```
 */
class BrowserLocalStorage extends memoryStorage_1.MemoryStorage {
    constructor(options) {
        super(options, localStorage);
    }
}
exports.BrowserLocalStorage = BrowserLocalStorage;
/**
 * Storage middleware that uses browser session storage.
 *
 * __Extends BotContext:__
 * * context.storage - Storage provider for storing and retrieving objects.
 *
 * **Usage Example**
 *
 * ```js
 * const bot = new Bot(adapter)
 *      .use(new BrowserSessionStorage())
 *      .use(new BotStateManage())
 *      .onReceive((context) => {
 *          context.reply(`Hello World`);
 *      })
 * ```
 */
class BrowserSessionStorage extends memoryStorage_1.MemoryStorage {
    constructor(options) {
        super(options, sessionStorage);
    }
}
exports.BrowserSessionStorage = BrowserSessionStorage;
//# sourceMappingURL=browserStorage.js.map