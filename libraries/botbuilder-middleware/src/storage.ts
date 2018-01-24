/**
 * @module botbuilder
 */
/** second comment block */

/** Interface for a store provider that stores and retrieves objects **/
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

/** Additional settings for a storage provider. */
export interface StorageSettings {
    /** 
     * If true the storage provider will optimize the writing of objects such that any read object 
     * which hasn't changed won't be actually written. The default value for all storage providers 
     * is true. 
     */
    optimizeWrites: boolean;
}

/** Object which is stored in Storage with an optional eTag */
export interface StoreItem {
    /** Key/value pairs. */
    [key: string]: any;

    /** (Optional) eTag field for stores that support optimistic concurrency. */
    eTag?: string;
}

/** Map of named `StoreItem` objects. */
export interface StoreItems {
    [key: string]: StoreItem;
}

