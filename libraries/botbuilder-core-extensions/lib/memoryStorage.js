"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * :package: **botbuilder-core-extensions**
 *
 * Memory based storage provider for a bot.
 */
class MemoryStorage {
    /**
     * Creates a new instance of the storage provider.
     * @param memory (Optional) memory to use for storing items.
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