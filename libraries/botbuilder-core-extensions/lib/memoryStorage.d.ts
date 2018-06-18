/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, StoreItems } from './storage';
/**
 * Memory based storage provider for a bot.
 *
 * @remarks
 * This provider is most useful for simulating production storage when running locally against the
 * emulator or as part of a unit test. It has the following characteristics:
 *
 * - Starts off completely empty when the bot is run.
 * - Anything written to the store will be forgotten when the process exits.
 * - Object that are read and written to the store are cloned to properly simulate network based
 *   storage providers.
 * - Cloned objects serialized using `JSON.stringify()` to catch any possible serialization related
 *   issues that might occur when using a network based storage provider.
 *
 * ```JavaScript
 * const { MemoryStorage } = require('botbuilder');
 *
 * const storage = new MemoryStorage();
 * ```
 */
export declare class MemoryStorage implements Storage {
    protected memory: {
        [k: string]: string;
    };
    protected etag: number;
    /**
     * Creates a new MemoryStorage instance.
     * @param memory (Optional) memory to use for storing items. By default it will create an empty JSON object `{}`.
     */
    constructor(memory?: {
        [k: string]: string;
    });
    read(keys: string[]): Promise<StoreItems>;
    write(changes: StoreItems): Promise<void>;
    delete(keys: string[]): Promise<void>;
}
