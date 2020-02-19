/* eslint-disable @typescript-eslint/no-unused-vars */
import { MemoryInterface } from './memoryInterface';

/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class StackedMemory extends Array<MemoryInterface> implements MemoryInterface {
    public static wrap(memory: MemoryInterface): StackedMemory {
        if (memory instanceof StackedMemory) {
            return memory;
        } else {
            const stackedMemory = new StackedMemory();
            stackedMemory.push(memory);
            return stackedMemory;
        }
    }

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

    public setValue(_path: string, _value: any): void {
        throw new Error(`Can't set value to ${ _path }, stacked memory is read-only`);
    }

    public version(): string {
        return '0';
    }
} 