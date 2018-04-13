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
 * Interface for a storage provider that stores and retrieves plain old JSON objects. 
 */
export interface Storage {
    /** 
     * Loads store items from storage
     *
     * **Usage Example**
     *
     * ```JavaScript
     * const items = await storage.read(['botState']);
     * const state = 'botState' in items ? items['botState'] : {};
     * ```
     * @param keys Array of item keys to read from the store. 
     **/
    read(keys: string[]): Promise<StoreItems>;

    /** 
     * Saves store items to storage.
     *
     * **Usage Example**
     *
     * ```JavaScript
     * state.topic = 'someTopic';
     * await storage.write({ 'botState': state });
     * ```
     * @param changes Map of items to write to storage.  
     **/
    write(changes: StoreItems): Promise<void>;

    /** 
     * Removes store items from storage
     *
     * **Usage Example**
     *
     * ```JavaScript
     * await storage.delete(['botState']);
     * ```
     * @param keys Array of item keys to remove from the store. 
     **/
    delete(keys: string[]): Promise<void>;
}

/** 
 * :package: **botbuilder-core-extensions**
 *
 * Object which is stored in Storage with an optional eTag.
 */
export interface StoreItem {
    /** Key/value pairs. */
    [key: string]: any;

    /** (Optional) eTag field for stores that support optimistic concurrency. */
    eTag?: string;
}

/** 
 * :package: **botbuilder-core-extensions**
 * 
 * Map of named `StoreItem` objects. 
 */
export interface StoreItems {
    [key: string]: StoreItem;
}

/**
 * :package: **botbuilder-core-extensions**
 * 
 * Utility function to calculate a change hash for a `StoreItem`.
 *
 * **Usage Example**
 *
 * ```JavaScript
 * // Calculate state objects initial hash
 * const hash = calculateChangeHash(state);
 * 
 * // Process the received activity 
 * await processActivity(context, state);
 * 
 * // Save state if changed
 * if (calculateChangeHash(state) !== hash) {
 *    await storage.write({ 'botState': state });
 * }
 * ```
 * @param item Item to calculate the change hash for.
 */
export function calculateChangeHash(item: StoreItem): string {
    const cpy = Object.assign({}, item);
    if (cpy.eTag) { delete cpy.eTag };
    return JSON.stringify(cpy);
}