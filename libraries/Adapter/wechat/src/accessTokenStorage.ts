/**
 * @module wechat
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Storage, StoreItems } from 'botbuilder-core';
import { WeChatAccessToken } from './weChatSchema';

/**
 * Storage provider for access token.
 */
export class AccessTokenStorage {
    private Storage: Storage;

    /**
     * Creates an instance of access token storage.
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
    public async SaveAsync(key: string, value: WeChatAccessToken): Promise<void> {
        const dict: StoreItems = {
            [key]: value
        };
        await this.Storage.write(dict);
    }

    /**
     * Loads store items from storage.
     * @param key Item key to read from the store.
     */
    public async GetAsync(key: string): Promise<WeChatAccessToken> {
        const result: StoreItems = await this.Storage.read([key]);
        if (result[key] === undefined) {
            return result[key];
        } else {
            const weChatResult = new WeChatAccessToken(result[key]);
            return weChatResult;
        }
    }

    /**
     * Removes store items from storage.
     * @param key Item key to remove from the store.
     */
    public async DeleteAsync(key: string): Promise<void> {
        await this.Storage.delete([key]);
    }
}