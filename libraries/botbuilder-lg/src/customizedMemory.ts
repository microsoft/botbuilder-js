/**
 * @module botframework-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { MemoryInterface, SimpleObjectMemory } from 'botframework-expressions';

export class CustomizedMemory implements MemoryInterface {

    public globalMemory: MemoryInterface;
    public localMemory: MemoryInterface;

    public constructor(scope?: any) {
        this.globalMemory = !scope ? undefined : SimpleObjectMemory.wrap(scope);
        this.localMemory = undefined;
    }

    public getValue(path: string): { value: any; error: string } {
        let value: any;
        let error = '';
        if (this.localMemory) {
            ({value, error} = this.localMemory.getValue(path));
            if (!error && value) {
                return {value, error};
            }
        }

        if (this.globalMemory) {
            return this.globalMemory.getValue(path);
        }

        return {value, error};
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public setValue(_path: string, _value: any): { value: any; error: string } {
        return {value: undefined, error: `LG memory are readonly`};
    }

    public  version(): string {
        return '0';
    }
}