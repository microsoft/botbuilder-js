/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Constant } from './constant';
import dayjs, { OpUnitType } from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import { Expression } from './expression';
import { ExpressionType } from './expressionType';
import { Options } from './options';
import { EvaluateExpressionDelegate, ValueWithError } from './expressionEvaluator';
import { MemoryInterface, SimpleObjectMemory, StackedMemory } from './memory';
import { TimexProperty } from '@microsoft/recognizers-text-data-types-timex-expression';
import bigInt = require('big-integer');
import util = require('util');

/**
 * Utility functions only used internal
 */
export class InternalFunctionUtils {
    /**
     * Constant for converting unix timestamp to ticks.
     */
    static readonly UnixMilliSecondToTicksConstant: bigInt.BigInteger = bigInt('621355968000000000');

    /**
     * Constant to convert between ticks and ms.
     */
    static readonly MillisecondToTickConstant: bigInt.BigInteger = bigInt('10000');

    /**
     * Parse timex funcition.
     *
     * @param timexExpr String or TimexProperty input.
     * @returns TimexProperty and error.
     */
    static parseTimexProperty(timexExpr: any): { timexProperty: TimexProperty; error: string } {
        let parsed: TimexProperty;
        if (timexExpr instanceof TimexProperty) {
            parsed = timexExpr;
        } else if (typeof timexExpr === 'string') {
            parsed = new TimexProperty(timexExpr);
        } else {
            parsed = new TimexProperty(timexExpr);
            if (parsed === undefined || Object.keys(parsed).length === 0) {
                return {
                    timexProperty: parsed,
                    error: `${timexExpr} requires a TimexProperty or a string as a argument`,
                };
            }
        }

        return { timexProperty: parsed, error: undefined };
    }

    /**
     * Sort helper function.
     *
     * @param isDescending Descending flag.
     * @returns The sorted array.
     */
    static sortBy(isDescending: boolean): EvaluateExpressionDelegate {
        return (expression: Expression, state: any, options: Options): ValueWithError => {
            let result: any;
            const { value: oriArr, error: childrenError } = expression.children[0].tryEvaluate(state, options);
            let error = childrenError;
            if (!error) {
                if (Array.isArray(oriArr)) {
                    // Ensures we don't mutate the array in place.
                    const arr: any = oriArr.slice(0);
                    if (expression.children.length === 1) {
                        if (isDescending) {
                            result = arr.sort().reverse();
                        } else {
                            result = arr.sort();
                        }
                    } else {
                        let propertyName: string;
                        ({ value: propertyName, error } = expression.children[1].tryEvaluate(state, options));

                        if (!error) {
                            propertyName = propertyName || '';
                        }

                        if (isDescending) {
                            result = arr.sort(InternalFunctionUtils.sortByKey(propertyName)).reverse();
                        } else {
                            result = arr.sort(InternalFunctionUtils.sortByKey(propertyName));
                        }
                    }
                } else {
                    error = `${expression.children[0]} is not an array`;
                }
            }

            return { value: result, error };
        };
    }

    /**
     * Lookup a string or number index of an Object.
     *
     * @param instance Instance with property.
     * @param index Property to lookup.
     * @returns Value and error information if any.
     */
    static accessIndex(instance: any, index: number): ValueWithError {
        // NOTE: This returns undefined rather than an error if instance is not present
        if (instance == null) {
            return { value: undefined, error: undefined };
        }

        let value: any;
        let error: string;

        if (Array.isArray(instance)) {
            if (index >= 0 && index < instance.length) {
                value = instance[index];
            } else {
                error = `${index} is out of range for ${instance}`;
            }
        } else {
            error = `${instance} is not a collection.`;
        }

        return { value, error };
    }

    /**
     * Verify a timestamp string is valid timestamp format.
     *
     * @param value Timestamp string to check.
     * @returns Error or undefined if invalid.
     */
    static verifyTimestamp(value: any): string | undefined {
        let error: string;
        try {
            const parsedData: Date = new Date(value);
            if (Number.isNaN(parsedData.getTime())) {
                error = `${value} is not a valid datetime string.`;
            }
        } catch {
            error = `${value} is not a valid datetime string.`;
        }

        return error;
    }

    /**
     * Verify a timestamp string is valid ISO timestamp format.
     *
     * @param value Timestamp string to check.
     * @returns Error or undefined if invalid.
     */
    static verifyISOTimestamp(value: any): string | undefined {
        let error: string;
        try {
            const parsedData: Date = new Date(value);
            if (Number.isNaN(parsedData.getTime())) {
                error = `${value} is not a valid datetime string.`;
            } else if (parsedData.toISOString() !== value) {
                error = `${value} is not a ISO format datetime string.`;
            }
        } catch {
            error = `${value} is not a valid datetime string.`;
        }

        return error;
    }

    /**
     * Convert a string input to ticks number.
     *
     * @param timeStamp String timestamp input.
     * @returns The string converted in ticks.
     */
    static ticks(timeStamp: string): ValueWithError {
        let result: bigInt.BigInteger;
        const error = this.verifyISOTimestamp(timeStamp);
        if (!error) {
            const unixMilliSec: number = dayjs(timeStamp).utc().valueOf();
            result = this.UnixMilliSecondToTicksConstant.add(
                bigInt(unixMilliSec).times(this.MillisecondToTickConstant)
            );
        }

        return { value: result, error };
    }

    /**
     * Lookup a property in Map or Object.
     *
     * @param instance Instance with property.
     * @param property Property to lookup.
     * @returns Value and error information if any.
     */
    static accessProperty(instance: any, property: string): ValueWithError {
        // NOTE: This returns undefined rather than an error if property is not present
        if (!instance) {
            return { value: undefined, error: undefined };
        }

        let value: any;
        let error: string;
        if (instance instanceof Map && (instance as Map<string, any>) !== undefined) {
            const instanceMap: Map<string, any> = instance as Map<string, any>;
            value = instanceMap.get(property);
            if (value === undefined) {
                const prop: string = Array.from(instanceMap.keys()).find(
                    (k: string): boolean => k.toLowerCase() === property.toLowerCase()
                );
                if (prop !== undefined) {
                    value = instanceMap.get(prop);
                }
            }
        } else {
            const prop: string = Object.keys(instance).find(
                (k: string): boolean => k.toLowerCase() === property.toLowerCase()
            );
            if (prop !== undefined) {
                value = instance[prop];
            }
        }

        return { value, error };
    }

    /**
     * Get the value of a path from a memory.
     *
     * @param state Memory.
     * @param path Path string.
     * @param options Options.
     * @returns The value of a path from a memory.
     */
    static wrapGetValue(state: MemoryInterface, path: string, options: Options): any {
        const result = state.getValue(path);
        if (result !== undefined) {
            return result;
        }

        if (options.nullSubstitution !== undefined) {
            return options.nullSubstitution(path);
        }

        return undefined;
    }

    /**
     * Wrap string or undefined into string. Default to empty string.
     *
     * @param input Input string
     * @returns The wrapped string.
     */
    static parseStringOrUndefined(input: string | undefined): string {
        if (typeof input === 'string') {
            return input;
        } else {
            return '';
        }
    }

    /**
     * Test result to see if True in logical comparison functions.
     *
     * @param instance Computed value.
     * @returns True if boolean true or non-null.
     */
    static isLogicTrue(instance: any): boolean {
        let result = true;

        if (typeof instance === 'boolean') {
            result = instance;
        } else if (instance == null) {
            result = false;
        }

        return result;
    }

    /**
     * Evaluator for foreach and select functions.
     *
     * @param expression Expression.
     * @param state Memory scope.
     * @param options Options.
     * @returns The evaluated list.
     */
    static foreach(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let result: any[];
        const { value: instance, error: childrenError } = expression.children[0].tryEvaluate(state, options);
        let error = childrenError;
        if (!instance) {
            error = `'${expression.children[0]}' evaluated to null.`;
        }

        if (!error) {
            const list = InternalFunctionUtils.convertToList(instance);
            if (!list) {
                error = `${expression.children[0]} is not a collection or structure object to run Foreach`;
            } else {
                result = [];
                InternalFunctionUtils.lambdaEvaluator(expression, state, options, list, (currentItem, r, e) => {
                    if (e) {
                        error = e;
                        return true;
                    } else {
                        result.push(r);
                        return false;
                    }
                });
            }
        }

        return { value: result, error };
    }

    /**
     * Lambda evaluator.
     *
     * @param expression expression.
     * @param state memory state.
     * @param options options.
     * @param list item list.
     * @param callback call back. return the should break flag.
     */
    static lambdaEvaluator<T = unknown, U = unknown>(
        expression: Expression,
        state: MemoryInterface,
        options: Options,
        list: T[],
        callback: (currentItem: T, result: U, error: string) => boolean
    ): void {
        const firstChild = expression.children[1].children[0];
        if (!(firstChild instanceof Constant) || typeof firstChild.value !== 'string') {
            return;
        }

        const iteratorName = firstChild.value;
        const stackedMemory = StackedMemory.wrap(state);
        for (const item of list) {
            const currentItem = item;
            const local: Map<string, any> = new Map<string, any>([[iteratorName, item]]);

            // the local iterator is pushed as one memory layer in the memory stack
            stackedMemory.push(SimpleObjectMemory.wrap(local));
            const { value: r, error: e } = expression.children[2].tryEvaluate(stackedMemory, options);
            stackedMemory.pop();

            const shouldBreak = callback(currentItem, r, e);
            if (shouldBreak) {
                break;
            }
        }
    }

    /**
     * Convert an object into array.
     * If the instance is array, return itself.
     * If the instance is object, return {key, value} pair list.
     * Else return undefined.
     *
     * @param instance input instance.
     * @returns The generated list.
     */
    static convertToList(instance: unknown): unknown[] | undefined {
        let arr: unknown[] | undefined;
        if (Array.isArray(instance)) {
            arr = instance;
        } else if (typeof instance === 'object') {
            arr = [];
            Object.keys(instance).forEach((u): number => arr.push({ key: u, value: instance[u] }));
        }

        return arr;
    }

    /**
     * Validator for foreach, select, and where functions.
     *
     * @param expression The expression to validate.
     */
    static ValidateLambdaExpression(expression: Expression): void {
        if (expression.children.length !== 3) {
            throw new Error(`Lambda expression expect 3 parameters, found ${expression.children.length}`);
        }

        const second: any = expression.children[1];
        if (!(second.type === ExpressionType.Accessor && second.children.length === 1)) {
            throw new Error(`Second parameter is not an identifier : ${second}`);
        }
    }

    /**
     * Parse string into URL object.
     *
     * @param uri Input string uri.
     * @returns The parsed URL object.
     */
    static parseUri(uri: string): ValueWithError {
        let result: URL;
        let error: string;
        try {
            result = new URL(uri);
        } catch {
            error = `Invalid URI: ${uri}`;
        }

        return { value: result, error };
    }

    /**
     * Transform C# period and unit into js period and unit.
     *
     * @param duration C# duration.
     * @param cSharpStr C# unit.
     * @returns The transformed timeUnit.
     */
    static timeUnitTransformer(duration: number, cSharpStr: string): { duration: number; tsStr: OpUnitType } {
        switch (cSharpStr) {
            case 'Day':
                return { duration, tsStr: 'day' };
            case 'Week':
                return { duration: duration * 7, tsStr: 'day' };
            case 'Second':
                return { duration, tsStr: 'second' };
            case 'Minute':
                return { duration, tsStr: 'minute' };
            case 'Hour':
                return { duration, tsStr: 'hour' };
            case 'Month':
                return { duration, tsStr: 'month' };
            case 'Year':
                return { duration, tsStr: 'year' };
            default:
                return { duration, tsStr: undefined };
        }
    }

    /**
     * TextEncoder helper function.
     *
     * @returns The text encoder.
     */
    static getTextEncoder(): TextEncoder {
        if (typeof window !== 'undefined' || typeof self !== 'undefined') {
            return new TextEncoder();
        }
        return new util.TextEncoder();
    }

    /**
     * TextDecoder helper function.
     *
     * @param code The encoding format.
     * @returns The text decoder.
     */
    static getTextDecoder(code = 'utf-8'): TextDecoder {
        if (typeof window !== 'undefined' || typeof self !== 'undefined') {
            return new TextDecoder(code);
        }
        return new util.TextDecoder(code);
    }

    /**
     * Common Stringify an object.
     *
     * @param input input object.
     * @returns the stringified object.
     */
    static commonStringify(input: unknown): string {
        if (input == null) {
            return '';
        }
        if (typeof input === 'object') {
            return JSON.stringify(input)
                .replace(/(^['"]*)/g, '')
                .replace(/(['"]*$)/g, '');
        } else {
            return input.toString();
        }
    }

    /**
     * @private
     */
    private static sortByKey(key: string) {
        return (a: unknown, b: unknown) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0);
    }
}
