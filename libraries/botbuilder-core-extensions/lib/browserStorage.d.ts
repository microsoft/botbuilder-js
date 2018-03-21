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
 * Storage provider that uses browser local storage.
 */
export declare class BrowserLocalStorage extends MemoryStorage {
    constructor();
}
/**
 * :package: **botbuilder-core-extensions**
 *
 * Storage provider that uses browser session storage.
 */
export declare class BrowserSessionStorage extends MemoryStorage {
    constructor();
}
