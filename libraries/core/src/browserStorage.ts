/**
 * @module botbuilder
 */
/** second comment block */
import { MemoryStorage } from './memoryStorage';
import { StorageSettings } from './storage';

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
export class BrowserLocalStorage extends MemoryStorage {
    public constructor(options?: StorageSettings) {
        super(options, localStorage);
    }
}

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
export class BrowserSessionStorage extends MemoryStorage {
    public constructor(options?: StorageSettings) {
        super(options, sessionStorage);
    }
}
