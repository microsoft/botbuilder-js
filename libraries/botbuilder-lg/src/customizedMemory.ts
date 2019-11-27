import { MemoryInterface, SimpleObjectMemory } from 'botframework-expressions';

/**
 * @module botframework-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class CustomizedMemory implements MemoryInterface {

    public globalMemory: MemoryInterface;
    public localMemory: MemoryInterface;

    public constructor(scope?: any) {
        this.globalMemory = scope === undefined || scope === null ? undefined : SimpleObjectMemory.wrap(scope);
        this.localMemory = undefined;
    }

    public getValue(path: string): { value: any; error: string } {
        let value: any;
        let error = '';
        if (this.localMemory !== undefined) {
            ({value, error} = this.localMemory.getValue(path));
            if (error === undefined && value !== undefined) {
                return {value, error};
            }
        }

        if (this.globalMemory !== undefined) {
            return this.globalMemory.getValue(path);
        }

        return {value, error};
    }

    public setValue(_path: string, _value: any): { value: any; error: string } {
        return {value: undefined, error: `LG memory are readonly`};
    }

    public  version(): string {
        return '0';
    }
}