/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import * as lodash from 'lodash';
import moment, { Moment } from 'moment';
import { TimexProperty } from '@microsoft/recognizers-text-data-types-timex-expression';
import { Constant } from './constant';
import { convertCSharpDateTimeToMomentJS } from './datetimeFormatConverter';
import { Expression } from './expression';
import { EvaluateExpressionDelegate, ValueWithError } from './expressionEvaluator';
import { ExpressionType } from './expressionType';
import { MemoryInterface, SimpleObjectMemory, StackedMemory } from './memory';
import { Options } from './options';
import { ReturnType } from './returnType';
import bigInt = require('big-integer');

/**
 * Verify the result of an expression is of the appropriate type and return a string if not.
 * @param value Value to verify.
 * @param expression Expression that produced value.
 * @param child Index of child expression.
 */
export type VerifyExpression = (value: any, expression: Expression, child: number) => string | undefined;

export class FunctionUtils {
    /**
     * The default date time format string.
     */
    public static readonly DefaultDateTimeFormat: string = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';

    /**
     * Constant for converting unix timestamp to ticks.
     */
    public static readonly UnixMilliSecondToTicksConstant: bigInt.BigInteger = bigInt('621355968000000000');

    /**
     * Constant to convert between ticks and ms.
     */
    public static readonly MillisecondToTickConstant: bigInt.BigInteger = bigInt('10000');

    /**
     * Validate that expression has a certain number of children that are of any of the supported types.
     * @param expression Expression to validate.
     * @param minArity Minimum number of children.
     * @param maxArity Maximum number of children.
     * @param returnType Allowed return types for children.
     * If a child has a return type of Object then validation will happen at runtime.
     */
    public static validateArityAndAnyType(expression: Expression, minArity: number, maxArity: number, returnType: ReturnType = ReturnType.Object): void {
        if (expression.children.length < minArity) {
            throw new Error(`${ expression } should have at least ${ minArity } children.`);
        }
        if (expression.children.length > maxArity) {
            throw new Error(`${ expression } can't have more than ${ maxArity } children.`);
        }

        if ((returnType & ReturnType.Object) === 0) {
            for (const child of expression.children) {
                if ((child.returnType & ReturnType.Object) === 0 && (returnType & child.returnType) === 0) {
                    throw new Error(FunctionUtils.buildTypeValidatorError(returnType, child, expression));
                }
            }
        }
    }

    /**
     * Validate the number and type of arguments to a function.
     * @param expression Expression to validate.
     * @param optional Optional types in order.
     * @param types Expected types in order.
     */
    public static validateOrder(expression: Expression, optional: ReturnType[], ...types: ReturnType[]): void {
        if (optional === undefined) {
            optional = [];
        }
        if (expression.children.length < types.length || expression.children.length > types.length + optional.length) {
            throw new Error(optional.length === 0 ?
                `${ expression } should have ${ types.length } children.`
                : `${ expression } should have between ${ types.length } and ${ types.length + optional.length } children.`);
        }

        for (let i = 0; i < types.length; i++) {
            const child: Expression = expression.children[i];
            const type: ReturnType = types[i];
            if ((type & ReturnType.Object) == 0
                && (child.returnType & ReturnType.Object) == 0
                && (type & child.returnType) == 0) {
                throw new Error(FunctionUtils.buildTypeValidatorError(type, child, expression));
            }
        }

        for (let i = 0; i < optional.length; i++) {
            const ic: number = i + types.length;
            if (ic >= expression.children.length) {
                break;
            }
            const child: Expression = expression.children[ic];
            const type: ReturnType = optional[i];
            if ((type & ReturnType.Object) == 0
                && (child.returnType & ReturnType.Object) == 0
                && (type & child.returnType) == 0) {
                throw new Error(FunctionUtils.buildTypeValidatorError(type, child, expression));
            }
        }
    }

    /**
     * Validate at least 1 argument of any type.
     * @param expression Expression to validate.
     */
    public static validateAtLeastOne(expression: Expression): void {

        FunctionUtils.validateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER);
    }

    /**
     * Validate 1 or more numeric arguments.
     * @param expression Expression to validate.
     */
    public static validateNumber(expression: Expression): void {

        FunctionUtils.validateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.Number);
    }

    /**
     * Validate 1 or more string arguments.
     * @param expression Expression to validate.
     */
    public static validateString(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.String);
    }

    /**
     * Validate there are two children.
     * @param expression Expression to validate.
     */
    public static validateBinary(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, 2);
    }

    /**
     * Validate 2 numeric arguments.
     * @param expression Expression to validate.
     */
    public static validateBinaryNumber(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, 2, ReturnType.Number);
    }

    /**
     * Validate 1 or 2 numeric arguments.
     * @param expression Expression to validate.
     */
    public static validateUnaryOrBinaryNumber(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, 2, ReturnType.Number);
    }

    /**
     * Validate 2 or more than 2 numeric arguments.
     * @param expression Expression to validate.
     */
    public static validateTwoOrMoreThanTwoNumbers(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, Number.MAX_VALUE, ReturnType.Number);
    }

    /**
     * Validate there are 2 numeric or string arguments.
     * @param expression Expression to validate.
     */
    public static validateBinaryNumberOrString(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, 2, ReturnType.Number | ReturnType.String);
    }

    /**
     * Validate there is a single argument.
     * @param expression Expression to validate.
     */
    public static validateUnary(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, 1);
    }

    /**
     * Validate there is a single argument.
     * @param expression Expression to validate.
     */
    public static validateUnaryNumber(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, 1, ReturnType.Number);
    }

    /**
     * Validate there is a single string argument.
     * @param expression Expression to validate.
     */
    public static validateUnaryString(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, 1, ReturnType.String);
    }

    /**
     * Validate there is one or two string arguments.
     * @param expression Expression to validate.
     */
    public static validateUnaryOrBinaryString(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, 2, ReturnType.String);
    }

    /**
     * Validate there is a single boolean argument.
     * @param expression Expression to validate.
     */
    public static validateUnaryBoolean(expression: Expression): void {
        FunctionUtils.validateOrder(expression, undefined, ReturnType.Boolean);
    }

    /**
     * Verify value is numeric.
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyNumber(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (!FunctionUtils.isNumber(value)) {
            error = `${ expression } is not a number.`;
        }

        return error;
    }

    /**
     * Verify value is numeric.
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyNumberOrNumericList(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (FunctionUtils.isNumber(value)) {
            return error;
        }

        if (!Array.isArray(value)) {
            error = `${ expression } is neither a list nor a number.`;
        } else {
            for (const elt of value) {
                if (!FunctionUtils.isNumber(elt)) {
                    error = `${ elt } is not a number in ${ expression }.`;
                    break;
                }
            }
        }

        return error;
    }

    /**
     * Verify value is numeric list.
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyNumericList(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (!Array.isArray(value)) {
            error = `${ expression } is not a list.`;
        } else {
            for (const elt of value) {
                if (!FunctionUtils.isNumber(elt)) {
                    error = `${ elt } is not a number in ${ expression }.`;
                    break;
                }
            }
        }

        return error;
    }

    /**
     * Verify value contains elements.
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyContainer(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (!(typeof value === 'string') && !Array.isArray(value) && !(value instanceof Map) && !(typeof value === 'object')) {
            error = `${ expression } must be a string, list, map or object.`;
        }

        return error;
    }

    /**
     * Verify value is not null or undefined.
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if valid.
     */
    public static verifyNotNull(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (value === undefined || value === null) {
            error = `${ expression } is null.`;
        }

        return error;
    }

    /**
     * Verify value is an integer.
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyInteger(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (!Number.isInteger(value)) {
            error = `${ expression } is not a integer.`;
        }

        return error;
    }

    /**
     * Verify value is an list.
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyList(value: any, expression: Expression): string | undefined {
        let error: string;
        if (!Array.isArray(value)) {
            error = `${ expression } is not a list or array.`;
        }

        return error;
    }

    /**
     * Verify value is a string.
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyString(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (typeof value !== 'string') {
            error = `${ expression } is not a string.`;
        }

        return error;
    }

    /**
     * Verify an object is neither a string nor null.
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyStringOrNull(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (typeof value !== 'string' && value !== undefined) {
            error = `${ expression } is neither a string nor a null object.`;
        }

        return error;
    }

    /**
     * Verify value is a number or string or null.
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyNumberOrStringOrNull(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (typeof value !== 'string' && value !== undefined && !FunctionUtils.isNumber(value)) {
            error = `${ expression } is neither a number nor string`;
        }

        return error;
    }

    /**
     * Verify value is a number or string.
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyNumberOrString(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (value === undefined || (!FunctionUtils.isNumber(value) && typeof value !== 'string')) {
            error = `${ expression } is not string or number.`;
        }

        return error;
    }

    /**
     * Verify value is boolean.
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyBoolean(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (typeof value !== 'boolean') {
            error = `${ expression } is not a boolean.`;
        }

        return error;
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
                error = `${ value } is not a valid datetime string.`;
            }
        } catch (e) {
            error = `${ value } is not a valid datetime string.`;
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
                error = `${ value } is not a valid datetime string.`;
            } else if (parsedData.toISOString() !== value) {
                error = `${ value } is not a ISO format datetime string.`;
            }
        } catch (e) {
            error = `${ value } is not a valid datetime string.`;
        }

        return error;
    }

    /**
     * Evaluate expression children and return them.
     * @param expression Expression with children.
     * @param state Global state.
     * @param verify Optional function to verify each child's result.
     * @returns List of child values or error message.
     */
    public static evaluateChildren(expression: Expression, state: MemoryInterface, options: Options, verify?: VerifyExpression): { args: any[]; error: string } {
        const args: any[] = [];
        let value: any;
        let error: string;
        let pos = 0;
        for (const child of expression.children) {
            ({ value, error } = child.tryEvaluate(state, options));
            if (error) {
                break;
            }
            if (verify !== undefined) {
                error = verify(value, child, pos);
            }
            if (error) {
                break;
            }
            args.push(value);
            ++pos;
        }

        return { args, error };
    }

    /**
     * Generate an expression delegate that applies function after verifying all children.
     * @param func Function to apply.
     * @param verify Function to check each arg for validity.
     * @returns Delegate for evaluating an expression.
     */
    public static apply(func: (arg0: any[]) => any, verify?: VerifyExpression): EvaluateExpressionDelegate {
        return (expression: Expression, state: MemoryInterface, options: Options): ValueWithError => {
            let value: any;
            let error: string;
            let args: any[];
            ({ args, error } = FunctionUtils.evaluateChildren(expression, state, options, verify));
            if (!error) {
                try {
                    value = func(args);
                } catch (e) {
                    error = e.message;
                }
            }

            return { value, error };
        };
    }

    /**
     * Generate an expression delegate that applies function after verifying all children.
     * @param func Function to apply.
     * @param verify Function to check each arg for validity.
     * @returns Delegate for evaluating an expression.
     */
    public static applyWithError(func: (arg0: any[]) => any, verify?: VerifyExpression): EvaluateExpressionDelegate {
        return (expression: Expression, state: MemoryInterface, options: Options): ValueWithError => {
            let value: any;
            let error: string;
            let args: any[];
            ({ args, error } = FunctionUtils.evaluateChildren(expression, state, options, verify));
            if (!error) {
                try {
                    ({ value, error } = func(args));
                } catch (e) {
                    error = e.message;
                }
            }

            return { value, error };
        };
    }

    /**
     * Generate an expression delegate that applies function on the accumulated value after verifying all children.
     * @param func Function to apply.
     * @param verify Function to check each arg for validity.
     * @returns Delegate for evaluating an expression.
     */
    public static applySequence(func: (arg0: any[]) => any, verify?: VerifyExpression): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): any => {
                const binaryArgs: any[] = [undefined, undefined];
                let soFar: any = args[0];
                for (let i = 1; i < args.length; i++) {
                    binaryArgs[0] = soFar;
                    binaryArgs[1] = args[i];
                    soFar = func(binaryArgs);
                }

                return soFar;
            },
            verify
        );
    }

    /**
     * Generate an expression delegate that applies function on the accumulated value after verifying all children.
     * @param func Function to apply.
     * @param verify Function to check each arg for validity.
     * @returns Delegate for evaluating an expression.
     */
    public static applySequenceWithError(func: (arg0: any[]) => any, verify?: VerifyExpression): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => {
                const binaryArgs: any[] = [undefined, undefined];
                let soFar: any = args[0];
                let value: any;
                let error: string;
                for (let i = 1; i < args.length; i++) {
                    binaryArgs[0] = soFar;
                    binaryArgs[1] = args[i];
                    ({ value, error } = func(binaryArgs));
                    if (error) {
                        return { value, error };
                    } else {
                        soFar = value;
                    }

                }

                return { value: soFar, error: undefined };
            },
            verify
        );
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
        if (instance instanceof Map && instance as Map<string, any> !== undefined) {
            const instanceMap: Map<string, any> = instance as Map<string, any>;
            value = instanceMap.get(property);
            if (value === undefined) {
                const prop: string = Array.from(instanceMap.keys()).find((k: string): boolean => k.toLowerCase() === property.toLowerCase());
                if (prop !== undefined) {
                    value = instanceMap.get(prop);
                }
            }
        } else {
            const prop: string = Object.keys(instance).find((k: string): boolean => k.toLowerCase() === property.toLowerCase());
            if (prop !== undefined) {
                value = instance[prop];
            }
        }

        return { value, error };
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
                error = `${ index } is out of range for ${ instance }`;
            }
        } else {
            error = `${ instance } is not a collection.`;
        }

        return { value, error };
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
     * Timestamp formatter, convert C# datetime to moment js format.
     * @param formatter C# datetime format
     */
    public static timestampFormatter(formatter: string): string {
        let result = formatter;
        try {
            result = convertCSharpDateTimeToMomentJS(formatter);
        } catch (e) {
            // do nothing
        }

        return result;
    }

    /**
     * Transform C# period and unit into js period and unit
     * @param duration C# duration
     * @param cSharpStr C# unit.
     */
    public static timeUnitTransformer(duration: number, cSharpStr: string): { duration: number; tsStr: string } {
        switch (cSharpStr) {
            case 'Day': return { duration, tsStr: 'days' };
            case 'Week': return { duration: duration * 7, tsStr: 'days' };
            case 'Second': return { duration, tsStr: 'seconds' };
            case 'Minute': return { duration, tsStr: 'minutes' };
            case 'Hour': return { duration, tsStr: 'hours' };
            case 'Month': return { duration, tsStr: 'months' };
            case 'Year': return { duration, tsStr: 'years' };
            default: return { duration, tsStr: undefined };
        }
    }

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
                return { timexProperty: parsed, error: `${ timexExpr } requires a TimexProperty or a string as a argument` };
            }
        }

        return { timexProperty: parsed, error: undefined };
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
     * State object for resolving memory paths.
     * @param expression Expression.
     * @param state Scope.
     * @param options Options used in evaluation.
     * @returns Return the accumulated path and the expression left unable to accumulate.
     */
    public static tryAccumulatePath(expression: Expression, state: MemoryInterface, options: Options): { path: string; left: any; error: string } {
        let path = '';
        let left = expression;
        while (left !== undefined) {
            if (left.type === ExpressionType.Accessor) {
                path = (left.children[0] as Constant).value + '.' + path;
                left = left.children.length === 2 ? left.children[1] : undefined;
            } else if (left.type === ExpressionType.Element) {
                const {value, error} = left.children[1].tryEvaluate(state, options);

                if (error !== undefined) {
                    return { path: undefined, left: undefined, error };
                }

                if (FunctionUtils.isNumber(parseInt(value))) {
                    path = `[${ value }].${ path }`;
                } else if (typeof value === 'string') {
                    path = `['${ value }'].${ path }`;
                } else {
                    return { path: undefined, left: undefined, error: `${ left.children[1].toString() } doesn't return an int or string` };
                }

                left = left.children[0];
            } else {
                break;
            }
        }

        // make sure we generated a valid path
        path = path.replace(/(\.*$)/g, '').replace(/(\.\[)/g, '[');
        if (path === '') {
            path = undefined;
        }

        return { path, left, error: undefined };
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
            error = `'${ expression.children[0] }' evaluated to null.`;
        }

        if (!error) {
            const iteratorName = (expression.children[1].children[0] as Constant).value as string;
            let arr = [];
            if (Array.isArray(instance)) {
                arr = instance;
            } else if (typeof instance === 'object') {
                Object.keys(instance).forEach((u): number => arr.push({ key: u, value: instance[u] }));
            } else {
                error = `${ expression.children[0] } is not a collection or structure object to run foreach`;
            }

            if (!error) {
                const stackedMemory = StackedMemory.wrap(state);
                result = [];
                for (const item of arr) {
                    const local: Map<string, any> = new Map<string, any>([
                        [iteratorName, item]
                    ]);

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
            throw new Error(`foreach expect 3 parameters, found ${ expression.children.length }`);
        }

        const second: any = expression.children[1];
        if (!(second.type === ExpressionType.Accessor && second.children.length === 1)) {
            throw new Error(`Second parameter of foreach is not an identifier : ${ second }`);
        }
    }

    /**
     * Is number helper function.
     * @param instance Input.
     * @returns True if the input is a number.
     */
    public static isNumber(instance: any): boolean {
        return instance !== undefined && instance !== null && typeof instance === 'number' && !Number.isNaN(instance);
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
                    error = `${ expression.children[0] } is not an array`;
                }

            }

            return { value: result, error };
        };
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
            error = `${ format } is not a valid timestamp format`;
        }

        return { value: result, error };
    }

    /**
     * Convert a string input to ticks number.
     * @param timeStamp String timestamp input.
     */
    public static ticks(timeStamp: string): ValueWithError {
        let parsed: any;
        let result: any;
        let error: string;
        ({ value: parsed, error } = FunctionUtils.parseTimestamp(timeStamp));
        if (!error) {
            const unixMilliSec: number = parseInt(moment(parsed).utc().format('x'), 10);
            result = this.UnixMilliSecondToTicksConstant.add(bigInt(unixMilliSec).times(this.MillisecondToTickConstant));
        }

        return { value: result, error };
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
            error = `Invalid URI: ${ uri }`;
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

        if (FunctionUtils.getPropertyCount(args[0]) === 0 && FunctionUtils.getPropertyCount(args[1]) === 0) {
            return true;
        }

        try {
            return args[0] === args[1];
        }
        catch
        {
            return false;
        }
    }

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

    private static buildTypeValidatorError(returnType: ReturnType, childExpr: Expression, expr: Expression): string {
        const names = Object.keys(ReturnType).filter((x): boolean => !(parseInt(x) >= 0));
        const types = [];
        for (const name of names) {
            const value = ReturnType[name] as number;
            if ((returnType & value) !== 0) {
                types.push(name);
            }
        }

        if (types.length === 1) {
            return `${ childExpr } is not a ${ types[0] } expression in ${ expr }.`;
        } else {
            const typesStr = types.join(', ');
            return `${ childExpr } in ${ expr } is not any of [${ typesStr }].`;
        }
    }
}
