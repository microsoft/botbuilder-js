/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { MemoryInterface, SimpleObjectMemory } from 'adaptive-expressions';

export class CustomizedMemory implements MemoryInterface {

    public globalMemory: MemoryInterface;
    public localMemory: MemoryInterface;

    public constructor(scope?: any) {
        this.globalMemory = !scope ? undefined : SimpleObjectMemory.wrap(scope);
        this.localMemory = undefined;
    }

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