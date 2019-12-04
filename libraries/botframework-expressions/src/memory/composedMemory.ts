/* eslint-disable @typescript-eslint/no-unused-vars */
import { MemoryInterface } from './memoryInterface';

/**
 * @module botframework-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class ComposedMemory implements MemoryInterface {

    private memoryMap: Map<string, MemoryInterface> = undefined;

    public constructor(memoryMap: Map<string, MemoryInterface>) {
        this.memoryMap = memoryMap;
    }

    public getValue(path: string): { value: any; error: string } {
        const prefix: string = path.split('.')[0];
        if (this.memoryMap.has(prefix)) {
            return this.memoryMap.get(prefix).getValue(path.substr(prefix.length + 1));
        }
        return {value: undefined, error: `path not exists at ${ path }`};
    }

    public setValue(_path: string, _value: any): { value: any; error: string } {
        throw new Error('Method not implemented.');
    }

    public  version(): string {
        return '0';
    }
}