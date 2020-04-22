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
    public globalMemory: MemoryInterface;

    /**
     * Local memory.
     */
    public localMemory: MemoryInterface;

    public constructor(scope?: any, localMemory?: MemoryInterface) {
        this.globalMemory = !scope ? undefined : SimpleObjectMemory.wrap(scope);
        this.localMemory = localMemory;
    }

    /**
     *  Try to get the value from a given path. Firstly, get result from global memory,
     *  if global memory does not contain, get from local memory.
     * @param path Memory path.
     * @returns Resolved value.
     */
    public getValue(path: string): any {
        if (this.localMemory) {
            const value = this.localMemory.getValue(path);
            if (value) {
                return value;
            }
        }

        if (this.globalMemory) {
            return this.globalMemory.getValue(path);
        }

        return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public setValue(_path: string, _value: any): void {
        return;
    }

    public  version(): string {
        return '0';
    }
}