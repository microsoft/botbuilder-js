import { MemoryInterface } from './memoryInterface';
import { Extensions } from '../extensions';

/**
 * @module botframework-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class SimpleObjectMemory implements MemoryInterface {

    private memory: any = undefined;
    private versionNumber: number = 0;

    public constructor(memory: any) {
        this.memory = memory;
    }

    public static wrap(obj: any): MemoryInterface {
        if(Extensions.isMemoryInterface(obj)) {
            return obj;
        }

        return new SimpleObjectMemory(obj);
    }

    public getValue(path: string): { value: any; error: string } {
        if (this.memory === undefined) {
            return {value: undefined, error: undefined};
        }

        const parts: string[] = path.split(/[.\[\]]+/).filter((u: string): boolean => u !== undefined && u !== '');
        let value: any;
        let curScope = this.memory;

        for (const part of parts) {
            let error: string;
            const idx = parseInt(part);
            if(!isNaN(idx) && Array.isArray(curScope)) {
                ({value, error} = Extensions.accessIndex(curScope, idx));
            } else {
                ({value, error} = Extensions.accessProperty(curScope, part));
            }

            if (error !== undefined) {
                return {value: undefined, error };
            }

            curScope = value;
        }

        return {value, error: undefined};
    }

    /**
     * In this simple object scope, we don't allow you to set a path in which some parts in middle don't exist
     * for example
     * if you set dialog.a.b = x, but dialog.a don't exist, this will result in an error
     * because we can't and shouldn't smart create structure in the middle
     * you can implement a customzied Scope that support such behavior
     */
    public setValue(path: string, input: any): { value: any; error: string } {
        if (this.memory === undefined) {
            return {value: undefined, error: `Can't set value with in a null memory`};
        }

        const parts: string[] = path.split(/[.\[\]]+/).filter((u: string): boolean => u !== undefined && u !== '');
        let curScope: any = this.memory;
        let curPath = '';
        let error: string = undefined;

        // find the 2nd last value, ie, the container
        for(let i = 0; i < parts.length - 1; i++) {
            const idx = parseInt(parts[i]);
            if(!isNaN(idx) && Array.isArray(curScope)) {
                curPath = `[${ parts[i] }]`;
                ({value: curScope, error} = Extensions.accessIndex(curScope, idx));
            } else {
                curPath = `.${ parts[i] }`;
                ({value: curScope, error} = Extensions.accessProperty(curScope, parts[i]));
            }

            if (error !== undefined) {
                return {value: undefined, error };
            }

            if (curScope === undefined) {
                curPath = curPath.replace(/(^\.*)/g, '');
                return {value: undefined, error: `Can't set value to path: '${ path }', reason: '${ curPath }' is null` };
            }
        }

        // set the last value
        const idx = parseInt(parts[parts.length - 1]);
        if(!isNaN(idx)) {
            if (Array.isArray(curScope)) {
                if (idx > curScope.length) {
                    error = `${ idx } index out of range`;
                } else if(idx === curScope.length) {
                    curScope.push(input);
                } else {
                    curScope[idx] = input;
                }
            } else {
                error = `set value for an index to a non-list object`;
            }

            if (error !== undefined) {
                return {value: undefined, error};
            }
        } else {
            error = Extensions.setProperty(curScope,parts[parts.length - 1], input).error;
            if (error !== undefined) {
                return {value: undefined, error: `Can set value to path: '${ path }', reason: ${ error }`};
            }
        }

        this.versionNumber++;
        return {value: input, error: undefined};
    }

    public  version(): string {
        return this.versionNumber.toString();
    }
    public toString(): string {
        return JSON.stringify(this.memory, this.getCircularReplacer());
    }

    private getCircularReplacer(): any {
        const seen = new WeakSet();
        return (_key: any, value: object): any => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return;
                }
                seen.add(value);
            }
            return value;
        };
    };
}