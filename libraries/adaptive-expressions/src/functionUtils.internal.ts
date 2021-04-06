/* eslint-disable security/detect-object-injection */
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
import { FunctionUtils } from './functionUtils';

/**
 * Utility functions only used internal
 */
export class InternalFunctionUtils {
    /**
     * Constant for converting unix timestamp to ticks.
     */
    public static readonly UnixMilliSecondToTicksConstant: bigInt.BigInteger = bigInt('621355968000000000');

    /**
     * Constant to convert between ticks and ms.
     */
    public static readonly MillisecondToTickConstant: bigInt.BigInteger = bigInt('10000');

    /**
     * Parse timex funcition.
     * @param timexExpr String or TimexProperty input.
     * @returns TimexProperty and error.
     */
    public static parseTimexProperty(timexExpr: unknown): { timexProperty: TimexProperty; error: string } {
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
     * @param isDescending Descending flag.
     */
    public static sortBy(isDescending: boolean): EvaluateExpressionDelegate {
        return (expression: Expression, state: MemoryInterface, options: Options): ValueWithError => {
            let result: unknown;
            const { value: oriArr, error: childrenError } = expression.children[0].tryEvaluate(state, options);
            let error = childrenError;
            if (!error) {
                if (Array.isArray(oriArr)) {
                    // Ensures we don't mutate the array in place.
                    const arr: unknown[] = oriArr.slice(0);
                    if (expression.children.length === 1) {
                        if (isDescending) {
                            result = arr.sort().reverse();
                        } else {
                            result = arr.sort();
                        }
                    } else {
                        const child1 = expression.children[1].tryEvaluate(state, options);

                        let propertyName: string;
                        if (!child1.error) {
                            propertyName = String(child1.value) || '';
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
     * @param instance Instance with property.
     * @param property Property to lookup.
     * @returns Value and error information if any.
     */
    public static accessIndex(instance: unknown, index: number): ValueWithError {
        // NOTE: This returns undefined rather than an error if property is not present
        if (instance == null) {
            return { value: undefined, error: undefined };
        }

        let value: unknown;
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
     * @param value Timestamp string to check.
     * @returns Error or undefined if invalid.
     */
    public static verifyTimestamp(value: unknown): string | undefined {
        let error: string;
        if (typeof value === 'string' || FunctionUtils.isNumber(value)) {
            try {
                const parsedData: Date = new Date(value as string | number);
                if (Number.isNaN(parsedData.getTime())) {
                    error = `${value} is not a valid datetime string.`;
                }
            } catch (e) {
                error = `${value} is not a valid datetime string.`;
            }
        } else if (!(value instanceof Date)) {
            error = `${value} is not a valid datetime string.`;
        }

        return error;
    }

    /**
     * Verify a timestamp string is valid ISO timestamp format.
     * @param value Timestamp string to check.
     * @returns Error or undefined if invalid.
     */
    public static verifyISOTimestamp(value: unknown): string | undefined {
        let error: string;
        if (typeof value !== 'string' && !FunctionUtils.isNumber(value) && !(value instanceof Date)) {
            error = `${value} is not a valid datetime string.`;
        } else {
            try {
                const parsedData: Date = value instanceof Date ? value : new Date(value as string | number);
                if (Number.isNaN(parsedData.getTime())) {
                    error = `${value} is not a valid datetime string.`;
                } else if (parsedData.toISOString() !== value) {
                    error = `${value} is not a ISO format datetime string.`;
                }
            } catch (e) {
                error = `${value} is not a valid datetime string.`;
            }
        }

        return error;
    }

    /**
     * Convert a string input to ticks number.
     * @param timeStamp String timestamp input.
     */
    public static ticks(timeStamp: string): ValueWithError {
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
     * @param instance Instance with property.
     * @param property Property to lookup.
     * @returns Value and error information if any.
     */
    public static accessProperty(instance: unknown, property: string): ValueWithError {
        // NOTE: This returns undefined rather than an error if property is not present
        if (!instance) {
            return { value: undefined, error: undefined };
        }

        let value: unknown;
        let error: string;
        if (instance instanceof Map) {
            value = instance.get(property);
            if (value === undefined) {
                const prop: string = Array.from(instance.keys()).find(
                    (k: string): boolean => k.toLowerCase() === property.toLowerCase()
                );
                if (prop !== undefined) {
                    value = instance.get(prop);
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
     * Get the value of a path from a memory
     * @param state Memory.
     * @param path Path string.
     * @param options Options.
     */
    public static wrapGetValue(state: MemoryInterface, path: string, options: Options): unknown {
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
     * @param input Input string
     */
    public static parseStringOrUndefined(input: unknown): string {
        if (typeof input === 'string') {
            return input;
        } else {
            return '';
        }
    }

    /**
     * Test result to see if True in logical comparison functions.
     * @param instance Computed value.
     * @returns True if boolean true or non-null.
     */
    public static isLogicTrue(instance: unknown): boolean {
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
     * @param expression Expression.
     * @param state Memory scope.
     * @param options Options.
     */
    public static foreach(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let result: unknown[];
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
     * @param expression expression.
     * @param state memory state.
     * @param options options.
     * @param list item list.
     * @param callback call back. return the should break flag.
     */
    public static lambdaEvaluator<T = unknown, U = unknown>(
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
            const local = { [iteratorName]: item };

            // the local iterator is pushed as one memory layer in the memory stack
            stackedMemory.push(SimpleObjectMemory.wrap(local));
            const { value: r, error: e } = expression.children[2].tryEvaluate(stackedMemory, options);
            stackedMemory.pop();

            const shouldBreak = callback(currentItem, r as U, e);
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
     * @param instance input instance.
     */
    public static convertToList<T, S>(
        instance: T[] | Record<string, S>
    ): (T | { key: string; value: S })[] | undefined {
        let arr: (T | { key: string; value: S })[] | undefined;
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
     * @param expression
     */
    public static ValidateLambdaExpression(expression: Expression): void {
        if (expression.children.length !== 3) {
            throw new Error(`Lambda expression expect 3 parameters, found ${expression.children.length}`);
        }

        const second = expression.children[1];
        if (!(second.type === ExpressionType.Accessor && second.children.length === 1)) {
            throw new Error(`Second parameter is not an identifier : ${second}`);
        }
    }

    /**
     * Parse string into URL object.
     * @param uri Input string uri.
     */
    public static parseUri(uri: string): { value: URL; error: string } {
        let result: URL;
        let error: string;
        try {
            result = new URL(uri);
        } catch (e) {
            error = `Invalid URI: ${uri}`;
        }

        return { value: result, error };
    }

    /**
     * Transform C# period and unit into js period and unit
     * @param duration C# duration
     * @param cSharpStr C# unit.
     */
    public static timeUnitTransformer(duration: number, cSharpStr: string): { duration: number; tsStr: OpUnitType } {
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
     * Equal helper function.
     * @param args Input args. Compare the first param and second param.
     */
    public static isEqual(firstItem: unknown, secondItem: unknown): boolean {
        if (firstItem == null || secondItem == null) {
            return firstItem == null && secondItem == null;
        }

        if (Array.isArray(firstItem) && firstItem.length === 0 && Array.isArray(secondItem) && secondItem.length === 0) {
            return true;
        }

        if (
            InternalFunctionUtils.getPropertyCount(firstItem) === 0 &&
            InternalFunctionUtils.getPropertyCount(secondItem) === 0
        ) {
            return true;
        }

        if (FunctionUtils.isNumber(firstItem) && FunctionUtils.isNumber(secondItem)) {
            if (Math.abs((firstItem as number) - (secondItem as number)) < Number.EPSILON) {
                return true;
            }
        }

        try {
            return firstItem === secondItem;
        } catch {
            return false;
        }
    }

    /**
     * TextEncoder helper function.
     */
    public static getTextEncoder(): TextEncoder {
        if (typeof window !== 'undefined' || typeof self !== 'undefined') {
            return new TextEncoder();
        }
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const util = require('util');
        return new util.TextEncoder();
    }

    /**
     * TextDecoder helper function.
     */
    public static getTextDecoder(code = 'utf-8'): TextDecoder {
        if (typeof window !== 'undefined' || typeof self !== 'undefined') {
            return new TextDecoder(code);
        }
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const util = require('util');
        return new util.TextDecoder(code);
    }

    /**
     * Common Stringfy an object.
     * @param input input object.
     */
    public static commonStringify(input: unknown): string {
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
     * Helper function of get the number of properties of an object.
     * @param obj An object.
     */
    private static getPropertyCount(obj: unknown): number {
        let count = -1;
        if (!Array.isArray(obj)) {
            if (obj instanceof Map) {
                count = obj.size;
            } else if (typeof obj === 'object' && !(obj instanceof Date)) {
                count = Object.keys(obj).length;
            }
        }

        return count;
    }

    /**
     * @private
     */
    private static sortByKey(key: string) {
        return (a: unknown, b: unknown) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0);
    }
}
