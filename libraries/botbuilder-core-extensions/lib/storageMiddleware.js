"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botService_1 = require("./botService");
/**
 * Abstract base class for all storage middleware.
 *
 * @param SETTINGS (Optional) settings to configure additional features of the storage provider.
 */
class StorageMiddleware extends botService_1.BotService {
    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings (Optional) settings to configure additional features of the storage provider.
     */
    constructor(settings) {
        super('storage');
        this.warningLogged = false;
        this.settings = Object.assign({
            optimizeWrites: true
        }, settings);
    }
    getService(context) {
        const storage = this.getStorage(context);
        return this.settings.optimizeWrites ? new WriteOptimizer(context, storage) : storage;
    }
}
exports.StorageMiddleware = StorageMiddleware;
class WriteOptimizer {
    constructor(context, storage) {
        this.context = context;
        this.storage = storage;
    }
    read(keys) {
        return this.storage.read(keys).then((items) => {
            // Remember hashes
            keys.forEach((key) => this.updatheashes(key, items[key]));
            return items;
        });
    }
    /** save StoreItems to storage  **/
    write(changes) {
        // Identify changes to commit
        let count = 0;
        const hashes = this.context.state.writeOptimizer || {};
        const newHashes = {};
        const commits = {};
        for (const key in changes) {
            const item = changes[key] || {};
            const hash = this.getHash(item);
            if (hashes[key] !== hash) {
                // New or changed item
                commits[key] = item;
                newHashes[key] = hash;
                count++;
            }
        }
        // Commit changes to storage
        if (count > 0) {
            return this.storage.write(commits).then(() => {
                // Update hashes
                for (const key in newHashes) {
                    this.updatheashes(key, newHashes[key]);
                }
            });
        }
        else {
            return Promise.resolve();
        }
    }
    /** Delete storeItems from storage **/
    delete(keys) {
        return this.storage.delete(keys).then(() => {
            // Remove hashes
            (keys || []).forEach((key) => this.updatheashes(key));
        });
    }
    updatheashes(key, itemOrHash) {
        // Ensure hashes
        let hashes = this.context.state.writeOptimizer;
        if (!hashes) {
            hashes = this.context.state.writeOptimizer = {};
        }
        // Update entry
        if (typeof itemOrHash === 'string') {
            hashes[key] = itemOrHash;
        }
        else if (itemOrHash) {
            hashes[key] = this.getHash(itemOrHash);
        }
        else if (hashes && hashes.hasOwnProperty(key)) {
            delete hashes[key];
        }
    }
    getHash(item) {
        const clone = Object.assign({}, item);
        if (clone.eTag) {
            delete clone.eTag;
        }
        ;
        return JSON.stringify(clone);
    }
}
//# sourceMappingURL=storageMiddleware.js.map