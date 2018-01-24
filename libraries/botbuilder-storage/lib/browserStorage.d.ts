/**
 * @module botbuilder-storage
 */
/** second comment block */
import { MemoryStorage } from './memoryStorage';
/**
 * Storage middleware that uses browser local storage.
 */
export declare class BrowserLocalStorage extends MemoryStorage {
    constructor();
}
/**
 * Storage middleware that uses browser session storage.
 */
export declare class BrowserSessionStorage extends MemoryStorage {
    constructor();
}
