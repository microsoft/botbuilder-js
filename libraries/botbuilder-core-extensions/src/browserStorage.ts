/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { MemoryStorage } from './memoryStorage';

/**
 * Storage provider that uses browser local storage.
 */
export class BrowserLocalStorage extends MemoryStorage {
    public constructor() {
        super(localStorage);
    }
}

/**
 * Storage provider that uses browser session storage.
 */
export class BrowserSessionStorage extends MemoryStorage {
    public constructor() {
        super(sessionStorage);
    }
}
