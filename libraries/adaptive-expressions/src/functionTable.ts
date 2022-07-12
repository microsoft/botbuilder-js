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
     * Gets a collection of string values that represent the keys of the [ExpressionFunctions.standardFunctions](xref:adaptive-expressions.ExpressionFunctions.standardFunctions).
     *
     * @returns A list of string values.
     */
    keys(): IterableIterator<string> {
        const keysOfAllFunctions = Array.from(ExpressionFunctions.standardFunctions.keys()).concat(
            Array.from(this.customFunctions.keys())
        );
        return keysOfAllFunctions[Symbol.iterator]();
    }

    /**
     * Gets a collection of [ExpressionEvaluator](xref:adaptive-expressions.ExpressionEvaluator) which is the value of the StandardFunctions.
     *
     * @returns A list of [ExpressionEvaluator](xref:adaptive-expressions.ExpressionEvaluator).
     */
    values(): IterableIterator<ExpressionEvaluator> {
        const valuesOfAllFunctions = Array.from(ExpressionFunctions.standardFunctions.values()).concat(
            Array.from(this.customFunctions.values())
        );
        return valuesOfAllFunctions[Symbol.iterator]();
    }

    /**
     * Gets the total number of [ExpressionFunctions.standardFunctions](xref:adaptive-expressions.ExpressionFunctions.standardFunctions) and user [customFunctions](xref:adaptive-expressions.FunctionTable.customFunctions).
     *
     * @returns An integer value.
     */
    get size(): number {
        return ExpressionFunctions.standardFunctions.size + this.customFunctions.size;
    }

    /**
     * Gets a value indicating whether the [FunctionTable](xref:adaptive-expressions.FunctionTable) is readonly.
     *
     * @returns A boolean value indicating whether the [FunctionTable](xref:adaptive-expressions.FunctionTable) is readonly.
     */
    get isReadOnly(): boolean {
        return false;
    }

    /**
     * Gets a value of [ExpressionEvaluator](xref:adaptive-expressions.ExpressionEvaluator) corresponding to the given key.
     *
     * @param key A string value of function name.
     * @returns An [ExpressionEvaluator](xref:adaptive-expressions.ExpressionEvaluator).
     */
    get(key: string): ExpressionEvaluator {
        if (ExpressionFunctions.standardFunctions.get(key)) {
            return ExpressionFunctions.standardFunctions.get(key);
        }

        if (this.customFunctions.get(key)) {
            return this.customFunctions.get(key);
        }

        return undefined;
    }

    /**
     * Sets a value of [ExpressionEvaluator](xref:adaptive-expressions.ExpressionEvaluator) corresponding to the given key.
     *
     * @param key A string value of function name.
     * @param value The value to set for the [ExpressionEvaluator](xref:adaptive-expressions.ExpressionEvaluator).
     * @returns The value of the [ExpressionEvaluator](xref:adaptive-expressions.ExpressionEvaluator).
     */
    set(key: string, value: ExpressionEvaluator): this {
        if (ExpressionFunctions.standardFunctions.get(key)) {
            throw Error("You can't overwrite a built in function.");
        }

        this.customFunctions.set(key, value);
        return this;
    }

    add(item: { key: string; value: ExpressionEvaluator }): void;
    add(key: string, value: ExpressionEvaluator): void;
    add(key: string, value: customFunction): void;

    /**
     * Inserts a mapping of a string key to [ExpressionEvaluator](xref:adaptive-expressions.ExpressionEvaluator) into [FunctionTable](xref:adaptive-expressions.FunctionTable).
     *
     * @param param1 Key-Value pair for the [ExpressionEvaluator](xref:adaptive-expressions.ExpressionEvaluator) or the function name to be added.
     * @param param2 Value of the [ExpressionEvaluator](xref:adaptive-expressions.ExpressionEvaluator) to be added or value of the user customized function to be added.
     */
    add(
        param1: { key: string; value: ExpressionEvaluator } | string,
        param2?: ExpressionEvaluator | customFunction
    ): void {
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

    /**
     * Clears the user [customFunctions](xref:adaptive-expressions.FunctionTable.customFunctions).
     */
    clear(): void {
        this.customFunctions.clear();
    }

    /**
     * Determines if the [FunctionTable](xref:adaptive-expressions.FunctionTable) has a given string key.
     *
     * @param key A string key.
     * @returns `True` if the key is contained, otherwise returns `False`.
     */
    has(key: string): boolean {
        return ExpressionFunctions.standardFunctions.has(key) || this.customFunctions.has(key);
    }

    /**
     * Deletes a specified key from user [customFunctions](xref:adaptive-expressions.FunctionTable.customFunctions).
     *
     * @param key A string key of function name.
     * @returns A boolean value indicating whether the key is successfully deleted.
     */
    delete(key: string): boolean {
        return this.customFunctions.delete(key);
    }

    /**
     * Operates on each element of the [ExpressionFunctions.standardFunctions](xref:adaptive-expressions.ExpressionFunctions.standardFunctions).
     * Not implemented.
     *
     * @param _callbackfn Callback function.
     * @param _thisArg Optional. This args.
     */
    forEach(
        _callbackfn: (value: ExpressionEvaluator, key: string, map: Map<string, ExpressionEvaluator>) => void,
        _thisArg?: any
    ): void {
        throw Error('forEach function not implemented');
    }

    /**
     * Returns an iterable of key, value pairs for every entry in the map.
     * Not implemented.
     */
    entries(): IterableIterator<[string, ExpressionEvaluator]> {
        throw Error('entries function not implemented');
    }

    /**
     * Returns an iterable of key, value pairs.
     * Not implemented.
     */
    get [Symbol.iterator](): () => IterableIterator<[string, ExpressionEvaluator]> {
        throw Error('Symbol.iterator function not implemented');
    }

    /**
     * Returns a string value.
     * Not implemented.
     */
    get [Symbol.toStringTag](): string {
        throw Error('Symbol.toStringTag function not implemented');
    }
}
