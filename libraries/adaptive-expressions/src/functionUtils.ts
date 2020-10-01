/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { Constant } from './constant';
import { convertCSharpDateTimeToMomentJS } from './datetimeFormatConverter';
import { Expression } from './expression';
import { EvaluateExpressionDelegate, ValueWithError } from './expressionEvaluator';
import { ExpressionType } from './expressionType';
import { MemoryInterface } from './memory';
import { Options } from './options';
import { ReturnType } from './returnType';

/**
 * Verify the result of an expression is of the appropriate type and return a string if not.
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
    public static readonly DefaultDateTimeFormat: string = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';

    /**
     * Validate that expression has a certain number of children that are of any of the supported types.
     * @param expression Expression to validate.
     * @param minArity Minimum number of children.
     * @param maxArity Maximum number of children.
     * @param returnType Allowed return types for children.
     * If a child has a return type of Object then validation will happen at runtime.
     */
    public static validateArityAndAnyType(
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
     * @param expression Expression to validate.
     * @param optional Optional types in order.
     * @param types Expected types in order.
     */
    public static validateOrder(expression: Expression, optional: ReturnType[], ...types: ReturnType[]): void {
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
                (type & ReturnType.Object) == 0 &&
                (child.returnType & ReturnType.Object) == 0 &&
                (type & child.returnType) == 0
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
                (type & ReturnType.Object) == 0 &&
                (child.returnType & ReturnType.Object) == 0 &&
                (type & child.returnType) == 0
            ) {
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
            error = `${expression} is not a number.`;
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
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyNumericList(value: any, expression: Expression, _: number): string | undefined {
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
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyContainer(value: any, expression: Expression, _: number): string | undefined {
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
     * Verify value is not null or undefined.
     * @param value Value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if valid.
     */
    public static verifyNotNull(value: any, expression: Expression, _: number): string | undefined {
        let error: string;
        if (value === undefined || value === null) {
            error = `${expression} is null.`;
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
            error = `${expression} is not a integer.`;
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
            error = `${expression} is not a list or array.`;
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
            error = `${expression} is not a string.`;
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
            error = `${expression} is neither a string nor a null object.`;
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
            error = `${expression} is neither a number nor string`;
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
            error = `${expression} is not string or number.`;
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
            error = `${expression} is not a boolean.`;
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
    public static evaluateChildren(
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
     * @param func Function to apply.
     * @param verify Function to check each arg for validity.
     * @returns Delegate for evaluating an expression.
     */
    public static applySequenceWithError(
        func: (arg0: any[]) => any,
        verify?: VerifyExpression
    ): EvaluateExpressionDelegate {
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
     * State object for resolving memory paths.
     * @param expression Expression.
     * @param state Scope.
     * @param options Options used in evaluation.
     * @returns Return the accumulated path and the expression left unable to accumulate.
     */
    public static tryAccumulatePath(
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
     * @param instance Input.
     * @returns True if the input is a number.
     */
    public static isNumber(instance: any): boolean {
        return instance !== undefined && instance !== null && typeof instance === 'number' && !Number.isNaN(instance);
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
}
