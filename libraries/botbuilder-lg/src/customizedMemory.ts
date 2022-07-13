/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { MemoryInterface, SimpleObjectMemory } from 'adaptive-expressions';

/**
 * A customized memory designed for LG evaluation, in which
 * we want to make sure the global memory (the first memory passed in) can be
 * accessible at any sub evaluation process.
 */
export class CustomizedMemory implements MemoryInterface {
    /**
     * Global memory.
     */
    globalMemory: MemoryInterface;

    /**
     * Local memory.
     */
    localMemory: MemoryInterface;

    /**
     * Creates a new instance of the [CustomizedMemory](xref:botbuilder-lg.CustomizedMemory) class.
     *
     * @param scope Optional. Scope.
     * @param localMemory Optional. Local memory.
     */
    constructor(scope?: unknown, localMemory?: MemoryInterface) {
        this.globalMemory = !scope ? undefined : SimpleObjectMemory.wrap(scope);
        this.localMemory = localMemory;
    }

    /**
     *  Try to get the value from a given path. Firstly, get result from global memory,
     *  if global memory does not contain, get from local memory.
     *
     * @param path Memory path.
     * @returns Resolved value.
     */
    getValue(path: string): any {
        if (this.localMemory) {
            const value = this.localMemory.getValue(path);
            if (value !== undefined) {
                return value;
            }
        }

        if (this.globalMemory) {
            return this.globalMemory.getValue(path);
        }

        return undefined;
    }

    /**
     * Set value to a given path. This method is not implemented.
     *
     * @param _path Memory path.
     * @param _value Value to set.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setValue(_path: string, _value: any): void {
        return;
    }

    /**
     * Used to identify whether a particular memory instance has been updated or not.
     * If version is not changed, the caller may choose to use the cached result instead of recomputing everything.
     *
     * @returns A string indicating the version.
     */
    version(): string {
        let result = '';
        if (this.globalMemory) {
            const version = this.globalMemory.version();
            if (version) {
                result = result.concat(version);
            }
        }

        if (this.localMemory) {
            const localVersion = this.localMemory.version();
            if (localVersion !== undefined) {
                result = result.concat(localVersion);
            }
        }

        return result;
    }
}
