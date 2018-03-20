/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Storage, StoreItem, StoreItems } from './storage';

/**
 * :package: **botbuilder-core-extensions**
 * 
 * Memory based storage provider for a bot.
 */
export class MemoryStorage  implements Storage {
    protected etag: number;


    /**
     * Creates a new instance of the storage provider.
     * @param memory (Optional) memory to use for storing items.
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
