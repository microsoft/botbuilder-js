import { MemoryInterface } from './memoryInterface';
import { Extensions } from '../extensions';
import { ExpressionFunctions } from '../expressionFunctions';

/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Simple implement of MemoryInterface
 */
export class SimpleObjectMemory implements MemoryInterface {

    private memory: any = undefined;
    private versionNumber: number = 0;

    public constructor(memory: any) {
        this.memory = memory;
    }

    /**
     * Transfer an common object to simple memory.
     * @param obj  Common object.
     * @returns Simple memory instance.
     */
    public static wrap(obj: any): MemoryInterface {
        if(Extensions.isMemoryInterface(obj)) {
            return obj;
        }

        return new SimpleObjectMemory(obj);
    }

    public getValue(path: string): any {
        if (this.memory === undefined || path.length === 0) {
            return undefined;
        }

        const parts: string[] = path.split(/[.\[\]]+/)
            .filter((u: string): boolean => u !== undefined && u !== '')
            .map((u: string): string => {
                if ((u.startsWith('"') && u.endsWith('"')) || (u.startsWith('\'') && u.endsWith('\''))) {
                    return u.substr(1, u.length - 2);
                } else {
                    return u;
                }
            });
        let value: any;
        let curScope = this.memory;

        for (const part of parts) {
            let error: string;
            const idx = parseInt(part);
            if(!isNaN(idx) && Array.isArray(curScope)) {
                ({value, error} = ExpressionFunctions.accessIndex(curScope, idx));
            } else {
                ({value, error} = ExpressionFunctions.accessProperty(curScope, part));
            }

            if (error) {
                return undefined;
            }

            curScope = value;
        }

        return value;
    }

    /**
     * In this simple object scope, we don't allow you to set a path in which some parts in middle don't exist
     * for example
     * if you set dialog.a.b = x, but dialog.a don't exist, this will result in an error
     * because we can't and shouldn't smart create structure in the middle
     * you can implement a customzied Scope that support such behavior
     */
    public setValue(path: string, input: any): void {
        if (this.memory === undefined) {
            return;;
        }

        const parts: string[] = path.split(/[.\[\]]+/)
            .filter((u: string): boolean => u !== undefined && u !== '')
            .map((u: string): string => {
                if ((u.startsWith('"') && u.endsWith('"')) || (u.startsWith('\'') && u.endsWith('\''))) {
                    return u.substr(1, u.length - 2);
                } else {
                    return u;
                }
            });
        let curScope: any = this.memory;
        let curPath = '';
        let error: string = undefined;

        // find the 2nd last value, ie, the container
        for(let i = 0; i < parts.length - 1; i++) {
            const idx = parseInt(parts[i]);
            if(!isNaN(idx) && Array.isArray(curScope)) {
                curPath = `[${ parts[i] }]`;
                ({value: curScope, error} = ExpressionFunctions.accessIndex(curScope, idx));
            } else {
                curPath = `.${ parts[i] }`;
                ({value: curScope, error} = ExpressionFunctions.accessProperty(curScope, parts[i]));
            }

            if (error) {
                return;
            }

            if (curScope === undefined) {
                curPath = curPath.replace(/(^\.*)/g, '');
                return;
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

            if (error) {
                return;
            }
        } else {
            error = ExpressionFunctions.setProperty(curScope,parts[parts.length - 1], input).error;
            if (error) {
                return;
            }
        }

        this.versionNumber++;
        return;
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
            if (typeof value === 'object' && value) {
                if (seen.has(value)) {
                    return;
                }
                seen.add(value);
            }
            return value;
        };
    };
}