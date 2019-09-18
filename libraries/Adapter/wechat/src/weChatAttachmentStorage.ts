/**
 * @module wechat
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Storage, StoreItems } from 'botbuilder-core';
import { UploadMediaResult } from './weChatSchema';

/**
 * We chat attachment storage
 */
export class WeChatAttachmentStorage {
    private Storage: Storage;

    /**
     * Creates an instance of we chat attachment storage.
     * @param storage
     */
    constructor(storage: Storage) {
        this.Storage = storage;
    }

    /**
     * Saves store items to storage.
     * @param key Item key to write to the storage.
     * @param value Item value to write to the storage.
     */
    async SaveAsync(key: string, value: UploadMediaResult): Promise<void> {
        const dict: StoreItems = {
            [key]: value,
        };
        await this.Storage.write(dict);
    }

    /**
     * Loads store items from storage.
     * @param key Item key to read from the store.
     */
    async GetAsync(key: string): Promise<UploadMediaResult> {
        const keys: string[] = [key];
        const result: StoreItems = await this.Storage.read(keys);
        const weChatResult: UploadMediaResult = result[key];
        return weChatResult;
    }

    /**
     * Removes store items from storage.
     * @param key Item key to remove from the store.
     */
    async DeleteAsync(key: string): Promise<void> {
        const keys: string[] = [key];
        await this.Storage.delete(keys);
    }
}