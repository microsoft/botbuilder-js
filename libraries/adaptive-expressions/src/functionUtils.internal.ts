/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Constant } from './constant';
import * as lodash from 'lodash';
import moment, { Moment } from 'moment';
import { Expression } from './expression';
import { ExpressionType } from './expressionType';
import { Options } from './options';
import { EvaluateExpressionDelegate, ValueWithError } from './expressionEvaluator';
import { MemoryInterface, SimpleObjectMemory, StackedMemory } from './memory';
import { TimexProperty } from '@microsoft/recognizers-text-data-types-timex-expression';
import bigInt = require('big-integer');

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
    public static parseTimexProperty(timexExpr: any): { timexProperty: TimexProperty; error: string } {
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
     * Convert string into Uint8Array object.
     * @param stringToConvert Input string.
     */
    public static toBinary(stringToConvert: string): Uint8Array {
        const result = new ArrayBuffer(stringToConvert.length);
        const bufferView = new Uint8Array(result);
        for (let i = 0; i < stringToConvert.length; i++) {
            bufferView[i] = stringToConvert.charCodeAt(i);
        }

        return bufferView;
    }

    /**
     * Sort helper function.
     * @param isDescending Descending flag.
     */
    public static sortBy(isDescending: boolean): EvaluateExpressionDelegate {
        return (expression: Expression, state: any, options: Options): ValueWithError => {
            let result: any;
            let error: string;
            let oriArr: any;
            ({ value: oriArr, error } = expression.children[0].tryEvaluate(state, options));
            if (!error) {
                if (Array.isArray(oriArr)) {
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
                            result = lodash.sortBy(arr, propertyName).reverse();
                        } else {
                            result = lodash.sortBy(arr, propertyName);
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
    public static accessIndex(instance: any, index: number): ValueWithError {
        // NOTE: This returns undefined rather than an error if property is not present
        if (instance === null || instance === undefined) {
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
     * @param value Timestamp string to check.
     * @returns Error or undefined if invalid.
     */
    public static verifyTimestamp(value: any): string | undefined {
        let error: string;
        try {
            const parsedData: Date = new Date(value);
            if (Number.isNaN(parsedData.getTime())) {
                error = `${value} is not a valid datetime string.`;
            }
        } catch (e) {
            error = `${value} is not a valid datetime string.`;
        }

        return error;
    }

    /**
     * Verify a timestamp string is valid ISO timestamp format.
     * @param value Timestamp string to check.
     * @returns Error or undefined if invalid.
     */
    public static verifyISOTimestamp(value: any): string | undefined {
        let error: string;
        try {
            const parsedData: Date = new Date(value);
            if (Number.isNaN(parsedData.getTime())) {
                error = `${value} is not a valid datetime string.`;
            } else if (parsedData.toISOString() !== value) {
                error = `${value} is not a ISO format datetime string.`;
            }
        } catch (e) {
            error = `${value} is not a valid datetime string.`;
        }

        return error;
    }

    /**
     * Transform a timestamp into another with customized function.
     * @param timeStamp Original time stamp.
     * @param transform Transform function.
     * @returns New timestamp and error.
     */
    public static parseTimestamp(timeStamp: string, transform?: (arg0: Date) => any): ValueWithError {
        let value: any;
        const error: string = this.verifyISOTimestamp(timeStamp);
        if (!error) {
            value = transform !== undefined ? transform(new Date(timeStamp)) : timeStamp;
        }

        return { value, error };
    }

    /**
     * Convert a string input to ticks number.
     * @param timeStamp String timestamp input.
     */
    public static ticks(timeStamp: string): ValueWithError {
        let parsed: any;
        let result: any;
        let error: string;
        ({ value: parsed, error } = this.parseTimestamp(timeStamp));
        if (!error) {
            const unixMilliSec: number = parseInt(moment(parsed).utc().format('x'), 10);
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
    public static accessProperty(instance: any, property: string): ValueWithError {
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
     * Get the value of a path from a memory
     * @param state Memory.
     * @param path Path string.
     * @param options Options.
     */
    public static wrapGetValue(state: MemoryInterface, path: string, options: Options): any {
        const result = state.getValue(path);
        if (result !== undefined && result !== null) {
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
    public static parseStringOrUndefined(input: string | undefined): string {
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
    public static isLogicTrue(instance: any): boolean {
        let result = true;

        if (typeof instance === 'boolean') {
            result = instance;
        } else if (instance === undefined || instance === null) {
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
        let result: any[];
        let error: string;
        let instance: any;

        ({ value: instance, error } = expression.children[0].tryEvaluate(state, options));
        if (!instance) {
            error = `'${expression.children[0]}' evaluated to null.`;
        }

        if (!error) {
            const iteratorName = (expression.children[1].children[0] as Constant).value as string;
            let arr = [];
            if (Array.isArray(instance)) {
                arr = instance;
            } else if (typeof instance === 'object') {
                Object.keys(instance).forEach((u): number => arr.push({ key: u, value: instance[u] }));
            } else {
                error = `${expression.children[0]} is not a collection or structure object to run foreach`;
            }

            if (!error) {
                const stackedMemory = StackedMemory.wrap(state);
                result = [];
                for (const item of arr) {
                    const local: Map<string, any> = new Map<string, any>([[iteratorName, item]]);

                    stackedMemory.push(SimpleObjectMemory.wrap(local));
                    const { value: r, error: e } = expression.children[2].tryEvaluate(stackedMemory, options);
                    stackedMemory.pop();
                    if (e !== undefined) {
                        return { value: undefined, error: e };
                    }
                    result.push(r);
                }
            }
        }

        return { value: result, error };
    }

    /**
     * Validator for foreach, select, and where functions.
     * @param expression
     */
    public static validateForeach(expression: Expression): void {
        if (expression.children.length !== 3) {
            throw new Error(`foreach expect 3 parameters, found ${expression.children.length}`);
        }

        const second: any = expression.children[1];
        if (!(second.type === ExpressionType.Accessor && second.children.length === 1)) {
            throw new Error(`Second parameter of foreach is not an identifier : ${second}`);
        }
    }

    /**
     * Parse string into URL object.
     * @param uri Input string uri.
     */
    public static parseUri(uri: string): ValueWithError {
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
    public static timeUnitTransformer(duration: number, cSharpStr: string): { duration: number; tsStr: string } {
        switch (cSharpStr) {
            case 'Day':
                return { duration, tsStr: 'days' };
            case 'Week':
                return { duration: duration * 7, tsStr: 'days' };
            case 'Second':
                return { duration, tsStr: 'seconds' };
            case 'Minute':
                return { duration, tsStr: 'minutes' };
            case 'Hour':
                return { duration, tsStr: 'hours' };
            case 'Month':
                return { duration, tsStr: 'months' };
            case 'Year':
                return { duration, tsStr: 'years' };
            default:
                return { duration, tsStr: undefined };
        }
    }

    /**
     * Format datetime.
     * @param timedata Input date time.
     * @param format Format flag.
     */
    public static returnFormattedTimeStampStr(timedata: Moment, format: string): ValueWithError {
        let result: string;
        let error: string;
        try {
            result = timedata.format(format);
        } catch (e) {
            error = `${format} is not a valid timestamp format`;
        }

        return { value: result, error };
    }

    /**
     * Equal helper function.
     * @param args Input args. Compare the first param and second param.
     */
    public static isEqual(args: any[]): boolean {
        if (args.length === 0) {
            return false;
        }

        if (args[0] === undefined || args[0] === null || args[1] === undefined || args[1] === null) {
            return (args[0] === undefined || args[0] === null) && (args[1] === undefined || args[1] === null);
        }

        if (Array.isArray(args[0]) && args[0].length === 0 && Array.isArray(args[1]) && args[1].length === 0) {
            return true;
        }

        if (
            InternalFunctionUtils.getPropertyCount(args[0]) === 0 &&
            InternalFunctionUtils.getPropertyCount(args[1]) === 0
        ) {
            return true;
        }

        try {
            return args[0] === args[1];
        } catch {
            return false;
        }
    }

    /**
     * Helper function of get the number of properties of an object.
     * @param obj An object.
     */
    private static getPropertyCount(obj: any): number {
        let count = -1;
        if (!Array.isArray(obj)) {
            if (obj instanceof Map) {
                count = obj.size;
            } else if (typeof obj === 'object') {
                count = Object.keys(obj).length;
            }
        }

        return count;
    }
}
