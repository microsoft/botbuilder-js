/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { BotService } from './botService';
import { Storage, StorageSettings, StoreItems, StoreItem } from './storage';

/**
 * Abstract base class for all storage middleware.
 *
 * @param SETTINGS (Optional) settings to configure additional features of the storage provider.
 */
export abstract class StorageMiddleware<SETTINGS extends StorageSettings = StorageSettings> extends BotService<Storage> {
    private warningLogged = false;

    /** Settings that configure the various features of the storage provider. */
    public settings: SETTINGS;
    
    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings (Optional) settings to configure additional features of the storage provider.
     */
    constructor(settings?: Partial<SETTINGS>) {
        super('storage');
        this.settings = Object.assign(<SETTINGS>{
            optimizeWrites: true
        }, settings);
    }

    protected getService(context: BotContext): Storage {
        const storage = this.getStorage(context);
        return this.settings.optimizeWrites ? new WriteOptimizer(context, storage) : storage;
    }

    /**
     * Overriden by derived classes to dynamically provide a storage provider instance for a given
     * request.
     *
     * @param context Context for the current turn of the conversation.
     */
    protected abstract getStorage(context: BotContext): Storage;
}

class WriteOptimizer implements Storage {
    constructor(private context: BotContext, private storage: Storage) {}

    public read(keys: string[]): Promise<StoreItems> {
        return this.storage.read(keys).then((items) => {
            // Remember hashes
            keys.forEach((key) => this.updatheashes(key, items[key]));
            return items;
        });
    }
    
    /** save StoreItems to storage  **/
    public write(changes: StoreItems): Promise<void> {
        // Identify changes to commit
        let count = 0;
        const hashes = this.context.state.writeOptimizer || {};
        const newHashes: { [key: string]: string; } = {};
        const commits: StoreItems = {};
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
        } else {
            return Promise.resolve();
        }
    }
    
    /** Delete storeItems from storage **/
    public delete(keys: string[]): Promise<void> {
        return this.storage.delete(keys).then(() => {
            // Remove hashes
            (keys || []).forEach((key) => this.updatheashes(key));
        });
    }

    private updatheashes(key: string, itemOrHash?: StoreItem|string) {
        // Ensure hashes
        let hashes = this.context.state.writeOptimizer;
        if (!hashes) {
            hashes = this.context.state.writeOptimizer = {};
        }

        // Update entry
        if (typeof itemOrHash === 'string') {
            hashes[key] = itemOrHash;
        } else if (itemOrHash) {
            hashes[key] = this.getHash(itemOrHash);
        } else if (hashes && hashes.hasOwnProperty(key)) {
            delete hashes[key];
        }     
    }

    private getHash(item: StoreItem): string {
        const clone = Object.assign({}, item);
        if (clone.eTag) { delete clone.eTag };
        return JSON.stringify(clone);
    }
}
