/**
 * @module botbuilder-storage
 */
/** second comment block */
import { MemoryStorage } from './memoryStorage';

/**
 * Storage middleware that uses browser local storage.
 */
export class BrowserLocalStorage extends MemoryStorage {
    public constructor() {
        super(localStorage);
    }
}

/**
 * Storage middleware that uses browser session storage.
 */
export class BrowserSessionStorage extends MemoryStorage {
    public constructor() {
        super(sessionStorage);
    }
}
