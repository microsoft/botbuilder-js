/* eslint-disable @typescript-eslint/no-unused-vars */
import { MemoryInterface } from './memoryInterface';

/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Stack implements of MemoryInterface.
 * Memory variables have a hierarchical relationship.
 */
export class StackedMemory extends Array<MemoryInterface> implements MemoryInterface {
    /**
     * Wraps an object that implements `MemoryInterface` into a `StackedMemory` object.
     * @param memory An object that implements `MemoryInterface`.
     * @returns A StackedMemory object.
     */
    public static wrap(memory: MemoryInterface): StackedMemory {
        if (memory instanceof StackedMemory) {
            return memory;
        } else {
            const stackedMemory = new StackedMemory();
            stackedMemory.push(memory);
            return stackedMemory;
        }
    }

    /**
     * Gets the value from a given path.
     * @param path Given path.
     * @returns The value from the given path if found, otherwise, undefined.
     */
    public getValue(path: string): any {
        if (this.length === 0) {
            return undefined;
        } else {
            for (const memory of Array.from(this).reverse()) {
                if (memory.getValue(path) !== undefined) {
                    return memory.getValue(path);
                }
            }

            return undefined;
        }
    }

    /**
     * Sets value to a given path.
     * @param _path Memory path.
     * @param _value Value to set.
     */
    public setValue(_path: string, _value: any): void {
        throw new Error(`Can't set value to ${_path}, stacked memory is read-only`);
    }

    /**
     * Gets the version of the current StackedMemory.
     * @returns A string value representing the version.
     */
    public version(): string {
        return '0';
    }
}