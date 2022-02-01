/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Interface to parse a string into an Expression
 */
export interface MemoryInterface {
    /**
     * get value from a given path, it can be a simple indenfiter like "a", or
     * a combined path like "a.b", "a.b[2]", "a.b[2].c", inside [] is guranteed to be a int number or a string.
     *
     * @param path memory path.
     * @returns value.
     */
    getValue(path: string): any;

    /**
     * Set value to a given path.
     *
     * @param path memory path.
     * @param value value to set.
     * @returns value
     */
    setValue(path: string, value: any): void;

    /**
     * Version is used to identify whether the a particular memory instance has been updated or not.
     * If version is not changed, the caller may choose to use the cached result instead of recomputing everything.
     */
    version(): string;
}
