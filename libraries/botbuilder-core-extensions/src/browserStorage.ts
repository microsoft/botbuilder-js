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
 * 
 * | package | middleware |
 * | ------- | :--------: |
 * | botbuilder-core-extensions | no | 
 */
export class BrowserLocalStorage extends MemoryStorage {
    public constructor() {
        super(localStorage);
    }
}

/**
 * Storage provider that uses browser session storage.
 * 
 * | package | middleware |
 * | ------- | :--------: |
 * | botbuilder-core-extensions | no | 
 */
export class BrowserSessionStorage extends MemoryStorage {
    public constructor() {
        super(sessionStorage);
    }
}
