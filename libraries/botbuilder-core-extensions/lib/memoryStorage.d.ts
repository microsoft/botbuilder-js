/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, StorageSettings, StoreItems } from './storage';
import { StorageMiddleware } from './storageMiddleware';
/**
 * Middleware that implements an in memory based storage provider for a bot.
 *
 * __Extends BotContext:__
 * * context.storage - Storage provider for storing and retrieving objects.
 *
 * **Usage Example**
 *
 * ```js
 * const bot = new Bot(adapter)
 *      .use(new MemoryStorage())
 *      .use(new BotStateManage())
 *      .onReceive((context) => {
 *          context.reply(`Hello World`);
 *      })
 * ```
 */
export declare class MemoryStorage extends StorageMiddleware<StorageSettings> implements Storage {
    protected memory: {
        [k: string]: string;
    };
    protected etag: number;
    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings (Optional) setting to configure the provider.
     * @param memory (Optional) memory to use for storing items.
     */
    constructor(settings?: Partial<StorageSettings>, memory?: {
        [k: string]: string;
    });
    read(keys: string[]): Promise<StoreItems>;
    write(changes: StoreItems): Promise<void>;
    delete(keys: string[]): Promise<void>;
    protected getStorage(context: BotContext): Storage;
}
