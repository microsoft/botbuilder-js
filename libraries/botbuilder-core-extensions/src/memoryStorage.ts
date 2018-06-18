/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Storage, StoreItem, StoreItems } from './storage';

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
export class MemoryStorage  implements Storage {
    protected etag: number;


    /**
     * Creates a new MemoryStorage instance.
     * @param memory (Optional) memory to use for storing items. By default it will create an empty JSON object `{}`.
     */
    public constructor(protected memory: { [k: string]: string; } = {}) {
        this.etag = 1;
    }

    public read(keys: string[]): Promise<StoreItems> {
        return new Promise<StoreItems>((resolve, reject) => {
            const data: StoreItems = {};
            keys.forEach((key) => {
                const item = this.memory[key];
                if (item) {
                    data[key] = JSON.parse(item);
                }
            });
            resolve(data);
        });
    };

    public write(changes: StoreItems): Promise<void> {
        const that = this;
        function saveItem(key: string, item: StoreItem) {
            const clone = Object.assign({}, item);
            clone.eTag = (that.etag++).toString();
            that.memory[key] = JSON.stringify(clone);
        }

        return new Promise<void>((resolve, reject) => {
            for (const key in changes) {
                const newItem = changes[key];
                const old = this.memory[key];
                if (!old || newItem.eTag === '*') {
                    saveItem(key, newItem);
                } else {
                    const oldItem = <StoreItem>JSON.parse(old);
                    if (newItem.eTag === oldItem.eTag) {
                        saveItem(key, newItem);
                    } else {
                        reject(new Error(`Storage: error writing "${key}" due to eTag conflict.`));
                    }
                }
            }
            resolve();
        });
    };

    public delete(keys: string[]) {
        return new Promise<void>((resolve, reject) => {
            keys.forEach((key) => this.memory[key] = <any>undefined);
            resolve();
        });
    }
}
