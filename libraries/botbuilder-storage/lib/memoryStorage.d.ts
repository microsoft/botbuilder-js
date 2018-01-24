/**
 * @module botbuilder-storage
 */
/** second comment block */
import { Storage, StoreItems } from './storage';
/**
 * Memory based key value storage.
 */
export declare class MemoryStorage implements Storage {
    protected memory: {
        [k: string]: string;
    };
    protected etag: number;
    /**
     * Creates a new instance of the storage provider.
     *
     * @param memory (Optional) memory to use for storing items.
     */
    constructor(memory?: {
        [k: string]: string;
    });
    read(keys: string[]): Promise<StoreItems>;
    write(changes: StoreItems): Promise<void>;
    delete(keys: string[]): Promise<void>;
}
