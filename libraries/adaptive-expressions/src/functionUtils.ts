/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Constant } from './constant';
import { convertCSharpDateTimeToDayjs } from './datetimeFormatConverter';
import { Expression } from './expression';
import { EvaluateExpressionDelegate, ValueWithError } from './expressionEvaluator';
import { ExpressionType } from './expressionType';
import { MemoryInterface } from './memory';
import { Options } from './options';
import { ReturnType } from './returnType';
// eslint-disable-next-line lodash/import-scope
import isEqual from 'lodash.isequal';

/**
 * Verify the result of an expression is of the appropriate type and return a string if not.
 *
 * @param value Value to verify.
 * @param expression Expression that produced value.
 * @param child Index of child expression.
 */
export type VerifyExpression = (value: any, expression: Expression, child: number) => string | undefined;

/**
 * Utility functions in AdaptiveExpression.
 */
export class FunctionUtils {
    /**
     * The default date time format string.
     */
    static readonly DefaultDateTimeFormat: string = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';

    /**
     * Validate that expression has a certain number of children that are of any of the supported types.
     *
     * @param expression Expression to validate.
     * @param minArity Minimum number of children.
     * @param maxArity Maximum number of children.
     * @param returnType Allowed return types for children.
     * If a child has a return type of Object then validation will happen at runtime.
     */
    static validateArityAndAnyType(
        expression: Expression,
        minArity: number,
        maxArity: number,
        returnType: ReturnType = ReturnType.Object
    ): void {
        if (expression.children.length < minArity) {
            throw new Error(`${expression} should have at least ${minArity} children.`);
        }
        if (expression.children.length > maxArity) {
            throw new Error(`${expression} can't have more than ${maxArity} children.`);
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
     *
     * @param expression Expression to validate.
     * @param optional Optional types in order.
     * @param types Expected types in order.
     */
    static validateOrder(expression: Expression, optional: ReturnType[], ...types: ReturnType[]): void {
        if (optional === undefined) {
            optional = [];
        }
        if (expression.children.length < types.length || expression.children.length > types.length + optional.length) {
            throw new Error(
                optional.length === 0
                    ? `${expression} should have ${types.length} children.`
                    : `${expression} should have between ${types.length} and ${
                          types.length + optional.length
                      } children.`
            );
        }

        for (let i = 0; i < types.length; i++) {
            const child: Expression = expression.children[i];
            const type: ReturnType = types[i];
            if (
                (type & ReturnType.Object) === 0 &&
                (child.returnType & ReturnType.Object) === 0 &&
                (type & child.returnType) === 0
            ) {
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
            if (
                (type & ReturnType.Object) === 0 &&
                (child.returnType & ReturnType.Object) === 0 &&
                (type & child.returnType) === 0
            ) {
                throw new Error(FunctionUtils.buildTypeValidatorError(type, child, expression));
            }
        }
    }

    /**
     * Validate at least 1 argument of any type.
     *
     * @param expression Expression to validate.
     */
    static validateAtLeastOne(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER);
    }

    /**
     * Validate 1 or more numeric arguments.
     *
     * @param expression Expression to validate.
     */
    static validateNumber(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.Number);
    }

    /**
     * Validate 1 or more string arguments.
     *
     * @param expression Expression to validate.
     */
    static validateString(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.String);
    }

    /**
     * Validate there are two children.
     *
     * @param expression Expression to validate.
     */
    static validateBinary(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, 2);
    }

    /**
     * Validate 2 numeric arguments.
     *
     * @param expression Expression to validate.
     */
    static validateBinaryNumber(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, 2, ReturnType.Number);
    }

    /**
     * Validate 1 or 2 numeric arguments.
     *
     * @param expression Expression to validate.
     */
    static validateUnaryOrBinaryNumber(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, 2, ReturnType.Number);
    }

    /**
     * Validate 2 or more than 2 numeric arguments.
     *
     * @param expression Expression to validate.
     */
    static validateTwoOrMoreThanTwoNumbers(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, Number.MAX_VALUE, ReturnType.Number);
    }

    /**
     * Validate there are 2 numeric or string arguments.
     *
     * @param expression Expression to validate.
     */
    static validateBinaryNumberOrString(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, 2, ReturnType.Number | ReturnType.String);
    }

    /**
     * Validate there is a single argument.
     *
     * @param expression Expression to validate.
     */
    static validateUnary(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, 1);
    }

    /**
     * Validate there is a single argument.
     *
     * @param expression Expression to validate.
     */
    static validateUnaryNumber(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, 1, ReturnType.Number);
    }

    /**
     * Validate there is a single string argument.
     *
     * @param expression Expression to validate.
     */
    static validateUnaryString(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, 1, ReturnType.String);
    }

    /**
     * Validate there is one or two string arguments.
     *
     * @param expression Expression to validate.
     */
    static validateUnaryOrBinaryString(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, 2, ReturnType.String);
    }

    /**
     * Validate there is a single boolean argument.
     *
     * @param expression Expression to validate.
     */
    static validateUnaryBoolean(expression: Expression): void {
        FunctionUtils.validateOrder(expression, undefined, ReturnType.Boolean);
    }

    /**
     * Verify value is numeric.
     *
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @param _ No function.
     * @returns Error or undefined if invalid.
     */
    static verifyNumber(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (!FunctionUtils.isNumber(value)) {
            error = `${expression} is not a number.`;
        }

        return error;
    }

    /**
     * Verify value is numeric.
     *
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @param _ No function.
     * @returns Error or undefined if invalid.
     */
    static verifyNumberOrNumericList(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (FunctionUtils.isNumber(value)) {
            return error;
        }

        if (!Array.isArray(value)) {
            error = `${expression} is neither a list nor a number.`;
        } else {
            for (const elt of value) {
                if (!FunctionUtils.isNumber(elt)) {
                    error = `${elt} is not a number in ${expression}.`;
                    break;
                }
            }
        }

        return error;
    }

    /**
     * Verify value is numeric list.
     *
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @param _ No function.
     * @returns Error or undefined if invalid.
     */
    static verifyNumericList(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (!Array.isArray(value)) {
            error = `${expression} is not a list.`;
        } else {
            for (const elt of value) {
                if (!FunctionUtils.isNumber(elt)) {
                    error = `${elt} is not a number in ${expression}.`;
                    break;
                }
            }
        }

        return error;
    }

    /**
     * Verify value contains elements.
     *
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @param _ No function.
     * @returns Error or undefined if invalid.
     */
    static verifyContainer(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (
            !(typeof value === 'string') &&
            !Array.isArray(value) &&
            !(value instanceof Map) &&
            !(typeof value === 'object')
        ) {
            error = `${expression} must be a string, list, map or object.`;
        }

        return error;
    }

    /**
     * Verify value contains elements or null.
     *
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @param _ No function.
     * @returns Error or undefined if invalid.
     */
    static verifyContainerOrNull(value: unknown, expression: Expression, _: number): string | undefined {
        let error: string;
        if (
            value != null &&
            !(typeof value === 'string') &&
            !Array.isArray(value) &&
            !(value instanceof Map) &&
            !(typeof value === 'object')
        ) {
            error = `${expression} must be a string, list, map or object.`;
        }

        return error;
    }

    /**
     * Verify value is not null or undefined.
     *
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @param _ No function.
     * @returns Error or undefined if valid.
     */
    static verifyNotNull(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (value == null) {
            error = `${expression} is null.`;
        }

        return error;
    }

    /**
     * Verify value is an integer.
     *
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @param _ No function.
     * @returns Error or undefined if invalid.
     */
    static verifyInteger(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (!Number.isInteger(value)) {
            error = `${expression} is not a integer.`;
        }

        return error;
    }

    /**
     * Verify value is an list.
     *
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    static verifyList(value: any, expression: Expression): string | undefined {
        let error: string;
        if (!Array.isArray(value)) {
            error = `${expression} is not a list or array.`;
        }

        return error;
    }

    /**
     * Verify value is a string.
     *
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @param _ No function.
     * @returns Error or undefined if invalid.
     */
    static verifyString(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (typeof value !== 'string') {
            error = `${expression} is not a string.`;
        }

        return error;
    }

    /**
     * Verify an object is neither a string nor null.
     *
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @param _ No function.
     * @returns Error or undefined if invalid.
     */
    static verifyStringOrNull(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (typeof value !== 'string' && value !== undefined) {
            error = `${expression} is neither a string nor a null object.`;
        }

        return error;
    }

    /**
     * Verify value is a number or string or null.
     *
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @param _ No function.
     * @returns Error or undefined if invalid.
     */
    static verifyNumberOrStringOrNull(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (typeof value !== 'string' && value !== undefined && !FunctionUtils.isNumber(value)) {
            error = `${expression} is neither a number nor string`;
        }

        return error;
    }

    /**
     * Verify value is a number or string.
     *
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @param _ No function.
     * @returns Error or undefined if invalid.
     */
    static verifyNumberOrString(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (value === undefined || (!FunctionUtils.isNumber(value) && typeof value !== 'string')) {
            error = `${expression} is not string or number.`;
        }

        return error;
    }

    /**
     * Verify value is boolean.
     *
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @param _ No function.
     * @returns Error or undefined if invalid.
     */
    static verifyBoolean(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (typeof value !== 'boolean') {
            error = `${expression} is not a boolean.`;
        }

        return error;
    }

    /**
     * Evaluate expression children and return them.
     *
     * @param expression Expression with children.
     * @param state Global state.
     * @param options Options used in evaluation.
     * @param verify Optional function to verify each child's result.
     * @returns List of child values or error message.
     */
    static evaluateChildren(
        expression: Expression,
        state: MemoryInterface,
        options: Options,
        verify?: VerifyExpression
    ): { args: any[]; error: string } {
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
     *
     * @param func Function to apply.
     * @param verify Function to check each arg for validity.
     * @returns Delegate for evaluating an expression.
     */
    static apply(func: (arg0: unknown[]) => unknown, verify?: VerifyExpression): EvaluateExpressionDelegate {
        return (expression: Expression, state: MemoryInterface, options: Options): ValueWithError => {
            let value: any;
            const { args, error: childrenError } = FunctionUtils.evaluateChildren(expression, state, options, verify);
            let error = childrenError;
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
     *
     * @param func Function to apply.
     * @param verify Function to check each arg for validity.
     * @returns Delegate for evaluating an expression.
     */
    static applyWithError(
        func: (arg0: any[]) => ValueWithError,
        verify?: VerifyExpression
    ): EvaluateExpressionDelegate {
        return (expression: Expression, state: MemoryInterface, options: Options): ValueWithError => {
            let value: any;
            const { args, error: childrenError } = FunctionUtils.evaluateChildren(expression, state, options, verify);
            let error = childrenError;
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
     * Generate an expression delegate that applies function after verifying all children.
     *
     * @param func Function to apply.
     * @param verify Function to check each arg for validity.
     * @returns Delegate for evaluating an expression.
     */
    static applyWithOptionsAndError(
        func: (arg0: unknown[], options: Options) => { value: unknown; error: string },
        verify?: VerifyExpression
    ): EvaluateExpressionDelegate {
        return (expression: Expression, state: MemoryInterface, options: Options): ValueWithError => {
            let value: unknown;
            const { args, error: childrenError } = FunctionUtils.evaluateChildren(expression, state, options, verify);
            let error = childrenError;
            if (!error) {
                try {
                    ({ value, error } = func(args, options));
                } catch (e) {
                    error = e.message;
                }
            }

            return { value, error };
        };
    }

    /**
     * Generate an expression delegate that applies function after verifying all children.
     *
     * @param func Function to apply.
     * @param verify Function to check each arg for validity.
     * @returns Delegate for evaluating an expression.
     */
    static applyWithOptions(
        func: (arg0: unknown[], options: Options) => unknown,
        verify?: VerifyExpression
    ): EvaluateExpressionDelegate {
        return (expression: Expression, state: MemoryInterface, options: Options): ValueWithError => {
            let value: unknown;
            const { args, error: childrenError } = FunctionUtils.evaluateChildren(expression, state, options, verify);
            let error = childrenError;
            if (!error) {
                try {
                    value = func(args, options);
                } catch (e) {
                    error = e.message;
                }
            }

            return { value, error };
        };
    }

    /**
     * Generate an expression delegate that applies function on the accumulated value after verifying all children.
     *
     * @param func Function to apply.
     * @param verify Function to check each arg for validity.
     * @returns Delegate for evaluating an expression.
     */
    static applySequence(func: (arg0: any[]) => any, verify?: VerifyExpression): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): any => {
            const binaryArgs: any[] = [undefined, undefined];
            let soFar: any = args[0];
            for (let i = 1; i < args.length; i++) {
                binaryArgs[0] = soFar;
                binaryArgs[1] = args[i];
                soFar = func(binaryArgs);
            }

            return soFar;
        }, verify);
    }

    /**
     * Generate an expression delegate that applies function on the accumulated value after verifying all children.
     *
     * @param func Function to apply.
     * @param verify Function to check each arg for validity.
     * @returns Delegate for evaluating an expression.
     */
    static applySequenceWithError(func: (arg0: any[]) => any, verify?: VerifyExpression): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: any[]): any => {
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
        }, verify);
    }

    /**
     *
     * @param args An array of arguments.
     * @param maxArgsLength The max length of a given function.
     * @param locale A locale string
     * @returns The last item from the args param, otherwise the locale string.
     */
    static determineLocale(args: unknown[], maxArgsLength: number, locale = 'en-us'): string {
        if (args.length === maxArgsLength) {
            const lastArg = args[maxArgsLength - 1];
            if (typeof lastArg === 'string') {
                locale = lastArg;
            }
        }

        return locale;
    }

    /**
     *
     * @param args An array of arguments.
     * @param maxArgsLength The max length of a given function.
     * @param format A format string.
     * @param locale A locale string.
     * @returns The format and the locale from the args param, otherwise the locale and format strings.
     */
    static determineFormatAndLocale(
        args: unknown[],
        maxArgsLength: number,
        format: string,
        locale = 'en-us'
    ): { format: string; locale: string } {
        if (maxArgsLength >= 2) {
            if (args.length === maxArgsLength) {
                const lastArg = args[maxArgsLength - 1];
                const secondLastArg = args[maxArgsLength - 2];
                if (typeof lastArg === 'string' && typeof secondLastArg === 'string') {
                    format =
                        secondLastArg !== ''
                            ? FunctionUtils.timestampFormatter(secondLastArg)
                            : FunctionUtils.DefaultDateTimeFormat;
                    locale = lastArg.substr(0, 2); //dayjs only support two-letter locale representattion
                }
            } else if (args.length === maxArgsLength - 1) {
                const lastArg = args[maxArgsLength - 2];
                if (typeof lastArg === 'string') {
                    format = FunctionUtils.timestampFormatter(lastArg);
                }
            }
        }

        return { format: format, locale: locale };
    }

    /**
     * Timestamp formatter, convert C# datetime to day.js format.
     *
     * @param formatter C# datetime format
     * @returns The formated datetime.
     */
    static timestampFormatter(formatter: string): string {
        if (!formatter) {
            return FunctionUtils.DefaultDateTimeFormat;
        }
        let result = formatter;
        try {
            result = convertCSharpDateTimeToDayjs(formatter);
        } catch {
            // do nothing
        }

        return result;
    }

    /**
     * State object for resolving memory paths.
     *
     * @param expression Expression.
     * @param state Scope.
     * @param options Options used in evaluation.
     * @returns Return the accumulated path and the expression left unable to accumulate.
     */
    static tryAccumulatePath(
        expression: Expression,
        state: MemoryInterface,
        options: Options
    ): { path: string; left: any; error: string } {
        let path = '';
        let left = expression;
        while (left !== undefined) {
            if (left.type === ExpressionType.Accessor) {
                path = (left.children[0] as Constant).value + '.' + path;
                left = left.children.length === 2 ? left.children[1] : undefined;
            } else if (left.type === ExpressionType.Element) {
                const { value, error } = left.children[1].tryEvaluate(state, options);

                if (error !== undefined) {
                    return { path: undefined, left: undefined, error };
                }

                if (FunctionUtils.isNumber(parseInt(value))) {
                    path = `[${value}].${path}`;
                } else if (typeof value === 'string') {
                    path = `['${value}'].${path}`;
                } else {
                    return {
                        path: undefined,
                        left: undefined,
                        error: `${left.children[1].toString()} doesn't return an int or string`,
                    };
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
     * Is number helper function.
     *
     * @param instance Input.
     * @returns True if the input is a number.
     */
    static isNumber(instance: any): instance is number {
        return instance != null && typeof instance === 'number' && !Number.isNaN(instance);
    }

    /**
     * Equal helper function.
     * Compare the first param and second param.
     *
     * @param obj1 The first value to compare.
     * @param obj2 The second value to compare.
     * @returns A boolean based on the comparison.
     */
    static commonEquals(obj1: unknown, obj2: unknown): boolean {
        if (obj1 == null || obj2 == null) {
            return obj1 == null && obj2 == null;
        }

        // Array Comparison
        if (Array.isArray(obj1) && Array.isArray(obj2)) {
            if (obj1.length !== obj2.length) {
                return false;
            }

            return obj1.every((item, i) => FunctionUtils.commonEquals(item, obj2[i]));
        }

        // Object Comparison
        const propertyCountOfObj1 = FunctionUtils.getPropertyCount(obj1);
        const propertyCountOfObj2 = FunctionUtils.getPropertyCount(obj2);
        if (propertyCountOfObj1 >= 0 && propertyCountOfObj2 >= 0) {
            if (propertyCountOfObj1 !== propertyCountOfObj2) {
                return false;
            }
            const jsonObj1 = FunctionUtils.convertToObj(obj1);
            const jsonObj2 = FunctionUtils.convertToObj(obj2);

            return isEqual(jsonObj1, jsonObj2);
        }

        // Number Comparison
        if (FunctionUtils.isNumber(obj1) && FunctionUtils.isNumber(obj2)) {
            if (Math.abs(obj1 - obj2) < Number.EPSILON) {
                return true;
            }
        }

        try {
            return obj1 === obj2;
        } catch {
            return false;
        }
    }

    /**
     * @private
     */
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
            return `${childExpr} is not a ${types[0]} expression in ${expr}.`;
        } else {
            const typesStr = types.join(', ');
            return `${childExpr} in ${expr} is not any of [${typesStr}].`;
        }
    }

    /**
     * Helper function of get the number of properties of an object.
     *
     * @param obj An object.
     * @returns The number of properties.
     */
    private static getPropertyCount(obj: unknown): number {
        let count = -1;
        if (obj != null && !Array.isArray(obj)) {
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
    private static convertToObj(instance: unknown) {
        if (FunctionUtils.getPropertyCount(instance) >= 0) {
            const entries = instance instanceof Map ? Array.from(instance.entries()) : Object.entries(instance);
            return entries.reduce((acc, [key, value]) => ({ ...acc, [key]: FunctionUtils.convertToObj(value) }), {});
        } else if (Array.isArray(instance)) {
            // Convert Array
            return instance.map((item) => FunctionUtils.convertToObj(item));
        }

        return instance;
    }
}
