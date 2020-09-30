/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator } from './expressionEvaluator';
import { ExpressionFunctions } from './expressionFunctions';
import { FunctionUtils } from './functionUtils';

type customFunction = (args: any[]) => any;

/**
 * FunctionTable is a dictionary which merges BuiltinFunctions.Functions with a CustomDictionary.
 */
export class FunctionTable implements Map<string, ExpressionEvaluator> {
    private readonly customFunctions = new Map<string, ExpressionEvaluator>();

    /**
     * Gets a collection of string values that represent the keys of the StandardFunctions.
     * @returns A list of string values.
     */
    public keys(): IterableIterator<string> {
        const keysOfAllFunctions = Array.from(ExpressionFunctions.standardFunctions.keys()).concat(Array.from(this.customFunctions.keys()));
        return keysOfAllFunctions[Symbol.iterator]();
    }

    /**
     * Gets a collection of ExpressionEvaluator which is the value of the StandardFunctions.
     * @returns A list of ExpressionEvaluator.
     */
    public values(): IterableIterator<ExpressionEvaluator> {
        const valuesOfAllFunctions = Array.from(ExpressionFunctions.standardFunctions.values()).concat(Array.from(this.customFunctions.values()));
        return valuesOfAllFunctions[Symbol.iterator]();
    }

    /**
     * Gets the total number of StandardFunctions and user customFunctions.
     * @returns An integer value.
     */
    public get size(): number {
        return ExpressionFunctions.standardFunctions.size + this.customFunctions.size;
    }

    /**
     * Gets a value indicating whether the FunctionTable is readonly.
     * @returns A boolean value indicating whether the FunctionTable is readonly.
     */
    public get isReadOnly(): boolean {
        return false;
    }

    /**
     * Gets a value of ExpressionEvaluator corresponding to the given key.
     * @param key A string value of function name.
     * @returns An ExpressionEvaluator.
     */
    public get(key: string): ExpressionEvaluator {

        if (ExpressionFunctions.standardFunctions.get(key)) {
            return ExpressionFunctions.standardFunctions.get(key);
        }

        if (this.customFunctions.get(key)) {
            return this.customFunctions.get(key);
        }

        return undefined;
    }

    /**
     * Sets a value of ExpressionEvaluator corresponding to the given key.
     * @param key A string value of function name.
     * @param value The value to set for the ExpressionEvaluator.
     */
    public set(key: string, value: ExpressionEvaluator): this {
        if (ExpressionFunctions.standardFunctions.get(key)) {
            throw Error(`You can't overwrite a built in function.`);
        }

        this.customFunctions.set(key, value);
        return this;

    }

    public add(item: { key: string; value: ExpressionEvaluator }): void;
    public add(key: string, value: ExpressionEvaluator): void;
    public add(key: string, value: customFunction): void;
    /**
     * Inserts a mapping of a string key to ExpressionEvaluator into FunctionTable.
     * @param param1 Key-Value for the ExpressionEvaluator or .
     * @param param2 
     */
    public add(param1: { key: string; value: ExpressionEvaluator } | string, param2?: ExpressionEvaluator | customFunction): void {
        if (arguments.length === 1) {
            if (param1 instanceof Object) {
                this.set(param1.key, param1.value);
            }
        } else {
            if (typeof param1 === 'string') {
                if (param2 instanceof ExpressionEvaluator) {
                    this.set(param1, param2);
                } else {
                    this.set(param1, new ExpressionEvaluator(param1, FunctionUtils.apply(param2)));
                }
            }
        }
    }

    public clear(): void {
        this.customFunctions.clear();
    }

    public has(key: string): boolean {
        return ExpressionFunctions.standardFunctions.has(key) || this.customFunctions.has(key);
    }

    public delete(key: string): boolean {
        return this.customFunctions.delete(key);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public forEach(_callbackfn: (value: ExpressionEvaluator, key: string, map: Map<string, ExpressionEvaluator>) => void, thisArg?: any): void {
        throw Error(`forEach function not implemented`);
    }

    public entries(): IterableIterator<[string, ExpressionEvaluator]> {
        throw Error(`entries function not implemented`);
    }

    public get [Symbol.iterator](): () => IterableIterator<[string, ExpressionEvaluator]> {
        throw Error(`Symbol.iterator function not implemented`);
    }

    public get [Symbol.toStringTag](): string {
        throw Error(`Symbol.toStringTag function not implemented`);
    }
}
