/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { MemoryStorage } from './memoryStorage';

/**
 * :package: **botbuilder-core-extensions**
 * 
 * Storage provider that uses browser local storage. This means that anything written to the store
 * will remain persisted until the user manually flushes their browsers cookies and other site 
 * data.
 *
 * **Usage Example**
 *
 * ```JavaScript
 * const { BrowserLocalStorage, UserState } = require('botbuilder');
 * 
 * const userState = new UserState(new BrowserLocalStorage());
 * ```
 */
export class BrowserLocalStorage extends MemoryStorage {
    /** Creates a new BrowserLocalStorage instance. */
    public constructor() {
        super(localStorage);
    }
}

/**
 * :package: **botbuilder-core-extensions**
 * 
 * Storage provider that uses browser session storage. This means that anything written to the
 * store will only be persisted for the lifetime of a single page within a browser tab. The storage
 * will survive page reloads but closing the tab will delete anything persisted by the store and 
 * opening a new browser tab will create a new persistance store for the page.  
 *
 * **Usage Example**
 *
 * ```JavaScript
 * const { BrowserSessionStorage, ConversationState } = require('botbuilder');
 * 
 * const conversationState = new ConversationState(new BrowserSessionStorage());
 * ```
 */
export class BrowserSessionStorage extends MemoryStorage {
    /** Creates a new BroserSessionStorage instance. */
    public constructor() {
        super(sessionStorage);
    }
}
