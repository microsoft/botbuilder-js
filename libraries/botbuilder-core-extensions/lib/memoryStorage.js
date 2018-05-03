"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
class MemoryStorage {
    /**
     * Creates a new MemoryStorage instance.
     * @param memory (Optional) memory to use for storing items. By default it will create an empty JSON object `{}`.
     */
    constructor(memory = {}) {
        this.memory = memory;
        this.etag = 1;
    }
    read(keys) {
        return new Promise((resolve, reject) => {
            const data = {};
            keys.forEach((key) => {
                const item = this.memory[key];
                if (item) {
                    data[key] = JSON.parse(item);
                }
            });
            resolve(data);
        });
    }
    ;
    write(changes) {
        const that = this;
        function saveItem(key, item) {
            const clone = Object.assign({}, item);
            clone.eTag = (that.etag++).toString();
            that.memory[key] = JSON.stringify(clone);
        }
        return new Promise((resolve, reject) => {
            for (const key in changes) {
                const newItem = changes[key];
                const old = this.memory[key];
                if (!old || newItem.eTag === '*') {
                    saveItem(key, newItem);
                }
                else {
                    const oldItem = JSON.parse(old);
                    if (newItem.eTag === oldItem.eTag) {
                        saveItem(key, newItem);
                    }
                    else {
                        reject(new Error(`Storage: error writing "${key}" due to eTag conflict.`));
                    }
                }
            }
            resolve();
        });
    }
    ;
    delete(keys) {
        return new Promise((resolve, reject) => {
            keys.forEach((key) => this.memory[key] = undefined);
            resolve();
        });
    }
}
exports.MemoryStorage = MemoryStorage;
//# sourceMappingURL=memoryStorage.js.map