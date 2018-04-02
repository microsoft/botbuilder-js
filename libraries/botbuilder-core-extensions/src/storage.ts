/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { TurnContext, Promiseable } from 'botbuilder-core';

/** 
 * :package: **botbuilder-core-extensions**
 * 
 * Callback to calculate a storage key.
 * @param StorageKeyFactory.context Context for the current turn of conversation with a user. 
 */
export type StorageKeyFactory = (context: TurnContext) => Promiseable<string>; 

/** 
 * :package: **botbuilder-core-extensions**
 * 
 * Interface for a store provider that stores and retrieves objects. 
 */
export interface Storage {
    /** 
     * Loads store items from storage
     *
     * @param keys Array of item keys to read from the store. 
     **/
    read(keys: string[]): Promise<StoreItems>;

    /** 
     * Saves store items to storage.
     *
     * @param changes Map of items to write to storage.  
     **/
    write(changes: StoreItems): Promise<void>;

    /** 
     * Removes store items from storage
     *
     * @param keys Array of item keys to remove from the store. 
     **/
    delete(keys: string[]): Promise<void>;
}

/** 
 * Object which is stored in Storage with an optional eTag.
 * 
 * | package |
 * | ------- |
 * | botbuilder-core-extensions | 
 */
export interface StoreItem {
    /** Key/value pairs. */
    [key: string]: any;

    /** (Optional) eTag field for stores that support optimistic concurrency. */
    eTag?: string;
}

/** 
 * Map of named `StoreItem` objects. 
 * 
 * | package |
 * | ------- |
 * | botbuilder-core-extensions | 
 */
export interface StoreItems {
    [key: string]: StoreItem;
}

/**
 * Utility function to calculate a change hash for a `StoreItem`.
 * 
 * | package |
 * | ------- |
 * | botbuilder-core-extensions | 
 * 
 * @param item Item to calculate the change hash for.
 */
export function calculateChangeHash(item: StoreItem): string {
    const cpy = Object.assign({}, item);
    if (cpy.eTag) { delete cpy.eTag };
    return JSON.stringify(cpy);
}