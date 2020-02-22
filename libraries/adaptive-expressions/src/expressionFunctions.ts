/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TimexProperty } from '@microsoft/recognizers-text-data-types-timex-expression';
import * as jsPath from 'jspath';
import * as lodash from 'lodash';
import * as moment from 'moment';
import * as timezone from 'moment-timezone';
import { CommonRegex } from './commonRegex';
import { Constant } from './constant';
import { Expression, ReturnType } from './expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator, ValidateExpressionDelegate } from './expressionEvaluator';
import { ExpressionType } from './expressionType';
import { Extensions } from './extensions';
import { TimeZoneConverter } from './timeZoneConverter';
import { convertCSharpDateTimeToMomentJS } from './formatConverter';
import { MemoryInterface, SimpleObjectMemory, StackedMemory } from './memory';

/**
 * Verify the result of an expression is of the appropriate type and return a string if not.
 * @param value Value to verify.
 * @param expression Expression that produced value.
 * @param child Index of child expression.
 */
export type VerifyExpression = (value: any, expression: Expression, child: number) => string | undefined;

/**
 *  <summary>
 *  Definition of default built-in functions for expressions.
 *  </summary>
 *  <remarks>
 *  These functions are largely from WDL https://docs.microsoft.com/en-us/azure/logic-apps/workflow-definition-language-functions-reference
 *  with a few extensions like infix operators for math, logic and comparisons.
 *  This class also has some methods that are useful to use when defining custom functions.
 *  You can always construct a <see cref="ExpressionEvaluator"/> directly which gives the maximum amount of control over validation and evaluation.
 *  Validators are static checkers that should throw an exception if something is not valid statically.
 *  Evaluators are called to evaluate an expression and should try not to throw.
 *  There are some evaluators in this file that take in a verifier that is called at runtime to verify arguments are proper.
 *  </remarks>
 */
export class ExpressionFunctions {
    /**
     * The default date time format string.
     */
    public static readonly DefaultDateTimeFormat: string = 'YYYY-MM-DDTHH:mm:ss.sssZ';

    /**
     * constant of converting unix timestamp to ticks
     */
    public static readonly UnixMilliSecondToTicksConstant: number = 621355968000000000;

    public static _functions: Map<string, ExpressionEvaluator> = ExpressionFunctions.buildFunctionLookup();

    /**
     * Validate that expression has a certain number of children that are of any of the supported types.
     * @param expression Expression to validate.
     * @param minArity Minimum number of children.
     * @param maxArity Maximum number of children.
     * @param types Allowed return types for children.
     * If a child has a return type of Object then validation will happen at runtime.
     */
    public static validateArityAndAnyType(expression: Expression, minArity: number, maxArity: number, ...types: ReturnType[]): void {
        if (expression.children.length < minArity) {
            throw new Error(`${ expression } should have at least ${ minArity } children.`);
        }
        if (expression.children.length > maxArity) {
            throw new Error(`${ expression } can't have more than ${ maxArity } children.`);
        }

        if (types.length > 0) {
            for (const child of expression.children) {

                if (child.returnType !== ReturnType.Object && !types.includes(child.returnType)) {
                    if (types.length === 1) {
                        throw new Error(`${ child } is not a ${ types[0] } expression in ${ expression.toString() }.`);
                    } else {
                        const builder = `${ child } in ${ expression.toString() } is not any of [`;
                        let first = true;
                        for (const type of types) {
                            if (first) {
                                first = false;
                            } else {
                                builder.concat('. ');
                            }
                            builder.concat(type.toString());
                        }
                        builder.concat('].');
                        throw new Error(builder);
                    }
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
            if (type !== ReturnType.Object && child.returnType !== ReturnType.Object && child.returnType !== type) {
                throw new Error(`${ child } in ${ expression } is not a ${ type }.`);
            }
        }

        for (let i = 0; i < optional.length; i++) {
            const ic: number = i + types.length;
            if (ic >= expression.children.length) {
                break;
            }
            const child: Expression = expression.children[ic];
            const type: ReturnType = optional[i];
            if (type !== ReturnType.Object && child.returnType !== ReturnType.Object && child.returnType !== type) {
                throw new Error(`${ child } in ${ expression } is not a ${ type }.`);
            }
        }
    }

    /**
     * Validate at least 1 argument of any type.
     * @param expression Expression to validate.
     */
    public static validateAtLeastOne(expression: Expression): void {

        ExpressionFunctions.validateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER);
    }

    /**
     * Validate 1 or more numeric arguments.
     * @param expression Expression to validate.
     */
    public static validateNumber(expression: Expression): void {

        ExpressionFunctions.validateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.Number);
    }

    /**
     * Validate 1 or more string arguments.
     * @param expression Expression to validate.
     */
    public static validateString(expression: Expression): void {
        ExpressionFunctions.validateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.String);
    }

    /**
     * Validate there are two children.
     * @param expression Expression to validate.
     */
    public static validateBinary(expression: Expression): void {
        ExpressionFunctions.validateArityAndAnyType(expression, 2, 2);
    }

    /**
     * Validate 2 numeric arguments.
     * @param expression Expression to validate.
     */
    public static validateBinaryNumber(expression: Expression): void {
        ExpressionFunctions.validateArityAndAnyType(expression, 2, 2, ReturnType.Number);
    }

    /**
     * Validate 2 or more than 2 numeric arguments.
     * @param expression Expression to validate.
     */
    public static validateTwoOrMoreThanTwoNumbers(expression: Expression): void {
        ExpressionFunctions.validateArityAndAnyType(expression, 2, Number.MAX_VALUE, ReturnType.Number);
    }

    /**
     * Validate there are 2 numeric or string arguments.
     * @param expression Expression to validate.
     */
    public static validateBinaryNumberOrString(expression: Expression): void {
        ExpressionFunctions.validateArityAndAnyType(expression, 2, 2, ReturnType.Number, ReturnType.String);
    }

    /**
     * Validate there is a single argument.
     * @param expression Expression to validate.
     */
    public static validateUnary(expression: Expression): void {
        ExpressionFunctions.validateArityAndAnyType(expression, 1, 1);
    }

    /**
     * Validate there is a single string argument.
     * @param expression Expression to validate.
     */
    public static validateUnaryString(expression: Expression): void {
        ExpressionFunctions.validateArityAndAnyType(expression, 1, 1, ReturnType.String);
    }

    /**
     * Validate there is a single boolean argument.
     * @param expression Expression to validate.
     */
    public static validateUnaryBoolean(expression: Expression): void {
        ExpressionFunctions.validateOrder(expression, undefined, ReturnType.Boolean);
    }

    /**
     * Verify value is numeric.
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyNumber(value: any, expression: Expression, _: number): string {
        let error: string;
        if (!ExpressionFunctions.isNumber(value)) {
            error = `${ expression } is not a number.`;
        }

        return error;
    }

    /**
     * Verify value is numeric.
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyNumberOrNumericList(value: any, expression: Expression, _: number): string {
        let error: string;
        if (ExpressionFunctions.isNumber(value)) {
            return error;
        }

        if (!Array.isArray(value)) {
            error = `${ expression } is neither a list nor a number.`;
        } else {
            for (const elt of value) {
                if (!ExpressionFunctions.isNumber(elt)) {
                    error = `${ elt } is not a number in ${ expression }.`;
                    break;
                }
            }
        }

        return error;
    }

    /**
     * Verify value is numeric list.
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyNumericList(value: any, expression: Expression, _: number): string {
        let error: string;
        if (!Array.isArray(value)) {
            error = `${ expression } is not a list.`;
        } else {
            for (const elt of value) {
                if (!ExpressionFunctions.isNumber(elt)) {
                    error = `${ elt } is not a number in ${ expression }.`;
                    break;
                }
            }
        }

        return error;
    }

    /**
     * Verify value contains elements.
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyContainer(value: any, expression: Expression, _: number): string {
        let error: string;
        if (!(typeof value === 'string') && !Array.isArray(value) && !(value instanceof Map)) {
            error = `${ expression } must be a string or list or map.`;
        }

        return error;
    }

    /**
     * Verify value is an integer.
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyInteger(value: any, expression: Expression, _: number): string {
        let error: string;
        if (!Number.isInteger(value)) {
            error = `${ expression } is not a integer.`;
        }

        return error;
    }

    /**
     * Verify value is an list.
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyList(value: any, expression: Expression): string {
        let error: string;
        if (!Array.isArray(value)) {
            error = `${ expression } is not a list or array.`;
        }

        return error;
    }

    /**
     * Verify value is a string.
     * @param value value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyString(value: any, expression: Expression, _: number): string {
        let error: string;
        if (typeof value !== 'string') {
            error = `${ expression } is not a string.`;
        }

        return error;
    }

    /**
     * Verify an object is neither a string nor null.
     * @param value value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyStringOrNull(value: any, expression: Expression, _: number): string {
        let error: string;
        if (typeof value !== 'string' && value !== undefined) {
            error = `${ expression } is neither a string nor a null object.`;
        }

        return error;
    }

    /**
     * Verify value is a number or string or null.
     * @param value value to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyNumberOrStringOrNull(value: any, expression: Expression, _: number): string {
        let error: string;
        if (typeof value !== 'string' && value !== undefined && !ExpressionFunctions.isNumber(value) ) {
            error = `${ expression } is neither a number nor string`;
        }

        return error;
    }

    /**
     * Verify value is a number or string.
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyNumberOrString(value: any, expression: Expression, _: number): string {
        let error: string;
        if (value === undefined || (!ExpressionFunctions.isNumber(value) && typeof value !== 'string')) {
            error = `${ expression } is not string or number.`;
        }

        return error;
    }

    /**
     * Verify value is boolean.
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyBoolean(value: any, expression: Expression, _: number): string {
        let error: string;
        if (typeof value !== 'boolean') {
            error = `${ expression } is not a boolean.`;
        }

        return error;
    }

    /**
     * Verify a timestamp string is valid timestamp format.
     * @param value timestamp string to check.
     * @returns Error or undefined if invalid.
     */
    public static verifyTimestamp(value: any): string {
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
     * @param value timestamp string to check.
     * @returns Error or undefined if invalid.
     */
    public static verifyISOTimestamp(value: any): string {
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
    public static evaluateChildren(expression: Expression, state: MemoryInterface, verify?: VerifyExpression): { args: any []; error: string } {
        const args: any[] = [];
        let value: any;
        let error: string;
        let pos = 0;
        for (const child of expression.children) {
            ({ value, error } = child.tryEvaluate(state));
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
    public static apply(func: (arg0: any []) => any, verify?: VerifyExpression): EvaluateExpressionDelegate {
        return (expression: Expression, state: MemoryInterface): { value: any; error: string } => {
            let value: any;
            let error: string;
            let args: any [];
            ({ args, error } = ExpressionFunctions.evaluateChildren(expression, state, verify));
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
    public static applyWithError(func: (arg0: any []) => any, verify?: VerifyExpression): EvaluateExpressionDelegate {
        return (expression: Expression, state: MemoryInterface): { value: any; error: string } => {
            let value: any;
            let error: string;
            let args: any [];
            ({ args, error } = ExpressionFunctions.evaluateChildren(expression, state, verify));
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
    public static applySequence(func: (arg0: any []) => any, verify?: VerifyExpression): EvaluateExpressionDelegate {
        return ExpressionFunctions.apply(
            (args: any []): any => {
                const binaryArgs: any[] = [undefined, undefined];
                let soFar: any = args[0];
                // tslint:disable-next-line: prefer-for-of
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
    public static applySequenceWithError(func: (arg0: any []) => any, verify?: VerifyExpression): EvaluateExpressionDelegate {
        return ExpressionFunctions.applyWithError(
            (args: any []): any => {
                const binaryArgs: any[] = [undefined, undefined];
                let soFar: any = args[0];
                let value: any;
                let error: string;
                // tslint:disable-next-line: prefer-for-of
                for (let i = 1; i < args.length; i++) {
                    binaryArgs[0] = soFar;
                    binaryArgs[1] = args[i];
                    ({value, error} = func(binaryArgs));
                    if (error) {
                        return {value, error};
                    } else {
                        soFar = value;
                    }

                }

                return {value: soFar, error: undefined};
            },
            verify
        );
    }

    /**
     * Numeric operators that can have 1 or more args.
     * @param type Expression type.
     * @param func Function to apply.
     */
    public static numeric(type: string, func: (arg0: any []) => any): ExpressionEvaluator {
        return new ExpressionEvaluator(type, ExpressionFunctions.applySequence(func, ExpressionFunctions.verifyNumber),
            ReturnType.Number, ExpressionFunctions.validateNumber);
    }

    /**
     * Numeric operators that can have 1 or more args.
     * @param type Expression type.
     * @param func Function to apply.
     */
    public static numericOrNumericList(type: string, func: (arg0: any []) => any): ExpressionEvaluator {
        return new ExpressionEvaluator(type, ExpressionFunctions.apply(func, ExpressionFunctions.verifyNumberOrNumericList),
            ReturnType.Number, ExpressionFunctions.validateAtLeastOne);
    }

    /**
     * Numeric operators that can have 2 or more args.
     * @param type Expression type.
     * @param func Function to apply.
     */
    public static multivariateNumeric(type: string, func: (arg0: any []) => any, verify?: VerifyExpression): ExpressionEvaluator {
        return new ExpressionEvaluator(type, ExpressionFunctions.applySequence(func, verify !== undefined ? verify : ExpressionFunctions.verifyNumber),
            ReturnType.Number, ExpressionFunctions.validateTwoOrMoreThanTwoNumbers);
    }
    /**
     * Comparison operators.
     * @param type Expression type.
     * @param func Function to apply.
     * @param validator Function to validate expression.
     * @param verify Function to verify arguments to expression.
     * @returns Delegate for evaluating an expression.
     * @description A comparison operator returns false if the comparison is false, or there is an error. This prevents errors from short-circuiting boolean expressions.
     */
    public static comparison(type: string, func: (arg0: any []) => boolean, validator: ValidateExpressionDelegate, verify?: VerifyExpression): ExpressionEvaluator {
        return new ExpressionEvaluator(
            type,
            (expression: Expression, state: MemoryInterface): { value: any; error: string } => {
                let result = false;
                let error: string;
                let args: any [];
                ({ args, error } = ExpressionFunctions.evaluateChildren(expression, state, verify));
                if (!error) {
                    const isNumber: boolean = args && args.length > 0 && typeof args[0] === 'number';
                    for (const arg of args) {
                        if (arg && (typeof arg === 'number') !== isNumber) {
                            error = `Arguments must either all be numbers or strings in ${ expression }`;
                            break;
                        }
                    }

                    if (!error) {
                        try {
                            result = func(args);
                        } catch (e) {
                            // NOTE: This should not happen in normal execution
                            error = e.message;
                        }
                    }
                } else {
                    error = undefined;
                }

                return { value: result, error };
            },
            ReturnType.Boolean,
            validator);
    }

    /**
     * Transform a string into another string.
     * @param type Expression type.
     * @param func Function to apply.
     */
    public static stringTransform(type: string, func: (arg0: any []) => any): ExpressionEvaluator {
        return new ExpressionEvaluator(type, ExpressionFunctions.apply(func, ExpressionFunctions.verifyStringOrNull),
            ReturnType.String, ExpressionFunctions.validateUnaryString);
    }

    /**
     * Transform a datetime into another datetime.
     * @param type Expression type.
     * @param func Transformer.
     * @returns Delegate for evaluating expression.
     */
    public static timeTransform(type: string, func: (timestamp: moment.Moment, numOfTransformation: any) => any): ExpressionEvaluator {
        return new ExpressionEvaluator(
            type,
            (expression: Expression, state: MemoryInterface): { value: any; error: string } => {
                let result: any;
                let error: string;
                let value: any;
                let args: any [];
                ({ args, error } = ExpressionFunctions.evaluateChildren(expression, state));
                if (!error) {
                    if (typeof args[0] === 'string' && typeof args[1] === 'number') {
                        ({ value, error } = ExpressionFunctions.parseTimestamp(args[0]));
                        if (!error) {
                            if (args.length === 3 && typeof args[2] === 'string') {
                                result = func(value, args[1]).format(ExpressionFunctions.timestampFormatter(args[2]));
                            } else {
                                result = func(value, args[1]).toISOString();
                            }
                        }
                    } else {
                        error = `${ expression } could not be evaluated`;
                    }
                }

                return { value: result, error };
            },
            ReturnType.String,
            // tslint:disable-next-line: no-void-expression
            (expr: Expression): void => ExpressionFunctions.validateArityAndAnyType(expr, 2, 3, ReturnType.String, ReturnType.Number));
    }

    private static parseTimestamp(timeStamp: string, transform?: (arg0: moment.Moment) => any): { value: any; error: string } {
        let value: any;
        const error: string = this.verifyISOTimestamp(timeStamp);
        if (!error) {
            const parsed: moment.Moment = moment(timeStamp).utc();
            value = transform !== undefined ? transform(parsed) : parsed;
        }

        return { value, error };
    }

    /**
     * Lookup a built-in function information by type.
     * @param type Type to look up.
     */
    public static lookup(type: string): ExpressionEvaluator {
        const evaluator: ExpressionEvaluator = ExpressionFunctions._functions.get(type);
        if (!evaluator) {
            throw new Error(`${ type } does not have an evaluator, it's not a built-in function or a customized function`);
        }

        return evaluator;
    }

    public static timestampFormatter(formatter: string): string {
        let result = formatter;
        try {
            result = convertCSharpDateTimeToMomentJS(formatter);
        } catch(e) {
            // do nothing
        }

        return result;
    }

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

    private static addOrdinal(num: number): string {
        let hasResult = false;
        let ordinalResult: string = num.toString();
        if (num > 0) {
            switch (num % 100) {
                case 11:
                case 12:
                case 13:
                    ordinalResult += 'th';
                    hasResult = true;
                    break;
                default:
                    break;
            }

            if (!hasResult) {
                switch (num % 10) {
                    case 1:
                        ordinalResult += 'st';
                        break;
                    case 2:
                        ordinalResult += 'nd';
                        break;
                    case 3:
                        ordinalResult += 'rd';
                        break;
                    default:
                        ordinalResult += 'th';
                        break;
                }
            }
        }

        return ordinalResult;
    }

    private static newGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: any): string => {
            const r: number = Math.random() * 16 | 0;
            // tslint:disable-next-line: no-bitwise
            const v: number = c === 'x' ? r : (r & 0x3 | 0x8);

            return v.toString(16);
        });
    }

    private static parseStringOrNull(input: string | undefined): string {
        if (typeof input === 'string') {
            return input;
        } else {
            return '';
        }
    }

    private static validateAccessor(expression: Expression): void {
        const children: Expression[] = expression.children;
        if (children.length === 0
            || !(children[0] instanceof Constant)
            || (children[0] as Constant).returnType !== ReturnType.String) {
            throw new Error(`${ expression } must have a string as first argument.`);
        }

        if (children.length > 2) {
            throw new Error(`${ expression } has more than 2 children.`);
        }
        if (children.length === 2 && children[1].returnType !== ReturnType.Object) {
            throw new Error(`${ expression } must have an object as its second argument.`);
        }
    }

    /**
     * Try to accumulate the path from an Accessor or Element, from right to left
     * return the accumulated path and the expression left unable to accumulate
     * @param expression 
     * @param state 
     */
    private static tryAccumulatePath(expression: Expression, state: MemoryInterface): {path: string; left: Expression; error: string} {
        let path = '';
        let left = expression;
        while (left !== undefined) {
            if (left.type === ExpressionType.Accessor) {
                path = (left.children[0] as Constant).value + '.' + path;
                left = left.children.length === 2 ? left.children[1] : undefined;
            } else if (left.type === ExpressionType.Element) {
                let value: any;
                let error: string;
                ({value, error} = left.children[1].tryEvaluate(state));

                if (error !== undefined) {
                    return {path: undefined, left: undefined, error};
                }

                if (isNaN(parseInt(value)) && typeof value !== 'string') {
                    return {path: undefined, left: undefined, error:`${ left.children[1].toString() } dones't return a int or string`};
                }

                path = `[${ value }].${ path }`;
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

        return {path, left, error:undefined};
    }

    private static accessor(expression: Expression, state: MemoryInterface): { value: any; error: string } {
        let path: string;
        let left: Expression;
        let error: string;
        ({path, left, error} = ExpressionFunctions.tryAccumulatePath(expression, state));
        if (error) {
            return {value: undefined, error};
        }

        if (left == undefined) {
            // fully converted to path, so we just delegate to memory scope
            return { value: state.getValue(path), error: undefined };
        } else {
            let newScope: any;
            let err: string;
            ({value: newScope, error: err} = left.tryEvaluate(state));
            if (err) {
                return {value: undefined, error: err};
            }

            return { value: new SimpleObjectMemory(newScope).getValue(path), error: undefined };
        }
    }

    private static getProperty(expression: Expression, state: MemoryInterface): { value: any; error: string } {
        let value: any;
        let error: string;
        let instance: any;
        let property: any;

        const children: Expression[] = expression.children;
        ({ value: instance, error } = children[0].tryEvaluate(state));
        if (!error) {
            ({ value: property, error } = children[1].tryEvaluate(state));

            if (!error) {
                value = new SimpleObjectMemory(instance).getValue(property.toString());
            }
        }

        return { value, error };
    }

    private static coalesce(objetcList: object[]): any {
        for (const obj of objetcList) {
            if (obj) {
                return obj;
            }
        }

        return undefined;
    }

    private static jPath(jsonEntity: object | string, path: string): {value: any; error: string} {
        let result: any;
        let error: string;
        let evaled: any;
        let json: object;
        if (typeof jsonEntity === 'string') {
            try {
                json = JSON.parse(jsonEntity);
            } catch (e) {
                error = `${ jsonEntity } is not a valid json string`;
            }
        } else if (typeof jsonEntity === 'object') {
            json = jsonEntity;
        } else {
            error = 'the first parameter should be either an object or a string';
        }

        if (!error) {
            try {
                evaled = jsPath.apply(path, json);
            } catch (e) {
                error = `${ path } is not a valid path + ${ e }`;
            }
        }

        result = evaled;

        return {value: result, error};
    }

    private static extractElement(expression: Expression, state: MemoryInterface): { value: any; error: string } {
        let value: any;
        let error: string;
        const instance: Expression = expression.children[0];
        const index: Expression = expression.children[1];
        let inst: any;
        ({ value: inst, error } = instance.tryEvaluate(state));
        if (!error) {
            let idxValue: any;
            ({ value: idxValue, error } = index.tryEvaluate(state));
            if (!error) {
                if (Number.isInteger(idxValue)) {
                    ({ value, error } = Extensions.accessIndex(inst, Number(idxValue)));
                } else if (typeof idxValue === 'string') {
                    ({ value, error } = Extensions.accessProperty(inst, idxValue.toString()));
                } else {
                    error = `Could not coerce ${ index } to an int or string.`;
                }

                return { value, error };
            }
        }
    }

    private static canBeModified(value: any, property: string, expected?: number): boolean {
        let modifiable = false;
        if (expected !== undefined) {
            // Modifiable list
            modifiable = Array.isArray(value);
        } else {
            // Modifiable object
            modifiable = value instanceof Map;
            if (!modifiable) {
                if (typeof value === 'object') {
                    modifiable = value.hasOwnProperty(property);
                }
            }
        }

        return modifiable;
    }

    private static setPathToValue(expression: Expression, state: MemoryInterface): { value: any; error: string } {
        let path: string;
        let left: Expression;
        let error: string;
        ({path, left, error} = ExpressionFunctions.tryAccumulatePath(expression.children[0], state));
        if (error !== undefined) {
            return {value: undefined, error};
        }

        if (left) {
            // the expression can't be fully merged as a path
            return {value: undefined, error:`${ expression.children[0].toString() } is not a valid path to set value`};
        }  
        let value: any;
        let err: string;
        ({value, error: err} = expression.children[1].tryEvaluate(state));
        if (err) {
            return {value: undefined, error: err};
        }

        state.setValue(path, value);
        return {value, error: undefined};
    }

    private static foreach(expression: Expression, state: MemoryInterface): { value: any; error: string } {
        let result: any[];
        let error: string;
        let instance: any;

        ({ value: instance, error } = expression.children[0].tryEvaluate(state));
        if (!instance) {
            error = `${ expression.children[0] } evaluated to null.`;
        }

        if (!error) {
            // 2nd parameter has been rewrite to $local.item
            const iteratorName = (expression.children[1].children[0] as Constant).value as string;
            let arr = [];
            if (Array.isArray(instance)) {
                arr = instance;
            } else if (typeof instance === 'object') {
                Object.keys(instance).forEach(u => arr.push({key: u, value: instance[u]}));
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
                    const { value: r, error: e } = expression.children[2].tryEvaluate(stackedMemory);
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

    private static where(expression: Expression, state: MemoryInterface): { value: any; error: string } {
        let result: any;
        let error: string;
        let instance: any;

        ({ value: instance, error } = expression.children[0].tryEvaluate(state));

        if (!error) {
            const iteratorName = (expression.children[1].children[0] as Constant).value as string;
            let arr: any[] = [];
            let isInstanceArray = false;
            if (Array.isArray(instance)) {
                arr = instance;
                isInstanceArray = true;
            } else if (typeof instance === 'object') {
                Object.keys(instance).forEach(u => arr.push({key: u, value: instance[u]}));
            } else {
                error = `${ expression.children[0] } is not a collection or structure object to run foreach`;
            }

            if (!error) {
                const stackedMemory = StackedMemory.wrap(state);
                const arrResult = [];
                for (const item of arr) {
                    const local: Map<string, any> = new Map<string, any>([
                        [iteratorName, item]
                    ]);

                    stackedMemory.push(SimpleObjectMemory.wrap(local));
                    const { value: r, error: e } = expression.children[2].tryEvaluate(stackedMemory);
                    stackedMemory.pop();
                    if (e !== undefined) {
                        return { value: undefined, error: e };
                    }

                    if ((Boolean(r))) {
                        arrResult.push(local.get(iteratorName));
                    }
                }

                //reconstruct object if instance is object, otherwise, return array result
                if (!isInstanceArray) {
                    let objResult = {};
                    for(const item of arrResult) {
                        objResult[item.key] = item.value;
                    }

                    result = objResult;
                } else {
                    result = arrResult;
                }
            }
        }

        return { value: result, error };
    }

    private static validateWhere(expression: Expression): void {
        ExpressionFunctions.validateForeach(expression);
    }

    private static validateForeach(expression: Expression): void {
        if (expression.children.length !== 3) {
            throw new Error(`foreach expect 3 parameters, found ${ expression.children.length }`);
        }

        const second: Expression = expression.children[1];
        if (!(second.type === ExpressionType.Accessor && second.children.length === 1)) {
            throw new Error(`Second parameter of foreach is not an identifier : ${ second }`);
        }
    }

    private static validateIsMatch(expression: Expression): void {
        ExpressionFunctions.validateArityAndAnyType(expression, 2, 2, ReturnType.String);

        const second: Expression = expression.children[1];
        if (second.returnType === ReturnType.String && second.type === ExpressionType.Constant) {
            // tslint:disable-next-line: restrict-plus-operands
            CommonRegex.CreateRegex((second as Constant).value + '');
        }
    }

    private static isNumber(instance: any): boolean {
        return instance !== undefined && instance !== null && typeof instance === 'number' && !Number.isNaN(instance);
    }

    private static isEmpty(instance: any): boolean {
        let result: boolean;
        if (instance === undefined) {
            result = true;
        } else if (typeof instance === 'string') {
            result = instance === '';
        } else if (Array.isArray(instance)) {
            result = instance.length === 0;
        } else if (instance instanceof Map) {
            result = instance.size === 0;
        } else {
            result = Object.keys(instance).length === 0;
        }

        return result;
    }

    /**
     * Test result to see if True in logical comparison functions.
     * @param instance Computed value.
     * @returns True if boolean true or non-null.
     */
    private static isLogicTrue(instance: any): boolean {
        let result = true;

        if (typeof instance === 'boolean') {
            result = instance;
        } else if (instance === undefined || instance === null) {
            result = false;
        }

        return result;
    }

    private static _and(expression: Expression, state: MemoryInterface): { value: any; error: string } {
        let result = false;
        let error: string;
        for (const child of expression.children) {
            ({ value: result, error } = child.tryEvaluate(state));
            if (!error) {
                if (this.isLogicTrue(result)) {
                    result = true;
                } else {
                    result = false;
                    break;
                }
            } else {
                result = false;
                error = undefined;
                break;
            }
        }

        return { value: result, error };
    }

    private static _or(expression: Expression, state: MemoryInterface): { value: any; error: string } {
        let result = false;
        let error: string;
        for (const child of expression.children) {
            ({ value: result, error } = child.tryEvaluate(state));
            if (!error) {
                if (this.isLogicTrue(result)) {
                    result = true;
                    break;
                }
            } else {
                error = undefined;
            }
        }

        return { value: result, error };
    }

    private static _not(expression: Expression, state: MemoryInterface): { value: any; error: string } {
        let result = false;
        let error: string;
        ({ value: result, error } = expression.children[0].tryEvaluate(state));
        if (!error) {
            result = !this.isLogicTrue(result);
        } else {
            error = undefined;
            result = true;
        }

        return { value: result, error };
    }

    private static _if(expression: Expression, state: MemoryInterface): { value: any; error: string } {
        let result: any;
        let error: string;
        ({ value: result, error } = expression.children[0].tryEvaluate(state));
        if (!error && this.isLogicTrue(result)) {
            ({ value: result, error } = expression.children[1].tryEvaluate(state));
        } else {
            ({ value: result, error } = expression.children[2].tryEvaluate(state));
        }

        return { value: result, error };
    }

    private static substring(expression: Expression, state: MemoryInterface): { value: any; error: string } {
        let result: any;
        let error: any;
        let str: string;
        ({ value: str, error } = expression.children[0].tryEvaluate(state));

        if (!error) {
            if (typeof str === 'string') {
                let start: number;

                const startExpr: Expression = expression.children[1];
                ({ value: start, error } = startExpr.tryEvaluate(state));
                if (!error && !Number.isInteger(start)) {
                    error = `${ startExpr } is not an integer.`;
                } else if (start < 0 || start >= str.length) {
                    error = `${ startExpr }=${ start } which is out of range for ${ str }`;
                }
                if (!error) {
                    let length: number;
                    if (expression.children.length === 2) {
                        // Without length, compute to end
                        length = str.length - start;
                    } else {
                        const lengthExpr: Expression = expression.children[2];
                        ({ value: length, error } = lengthExpr.tryEvaluate(state));
                        if (!error && !Number.isInteger(length)) {
                            error = `${ lengthExpr } is not an integer`;
                        } else if (length < 0 || Number(start) + Number(length) > str.length) {
                            error = `${ lengthExpr }=${ length } which is out of range for ${ str }`;
                        }
                    }
                    if (!error) {
                        result = str.substr(start, length);
                    }
                }
            } else if (str === undefined) {
                result = '';
            } else {
                error = `${ expression.children[0] } is neither a string nor a null object.`;
            }
        }

        return { value: result, error };
    }

    private static skip(expression: Expression, state: any): { value: any; error: string } {
        let result: any;
        let error: any;
        let arr: any;
        ({ value: arr, error } = expression.children[0].tryEvaluate(state));

        if (!error) {
            if (Array.isArray(arr)) {
                let start: number;

                const startExpr: Expression = expression.children[1];
                ({ value: start, error } = startExpr.tryEvaluate(state));
                if (!error && !Number.isInteger(start)) {
                    error = `${ startExpr } is not an integer.`;
                } else if (start < 0 || start >= arr.length) {
                    error = `${ startExpr }=${ start } which is out of range for ${ arr }`;
                }
                if (!error) {
                    result = arr.slice(start);
                }
            } else {
                error = `${ expression.children[0] } is not array.`;
            }
        }

        return { value: result, error };
    }

    private static take(expression: Expression, state: any): { value: any; error: string } {
        let result: any;
        let error: any;
        let arr: any;
        ({ value: arr, error } = expression.children[0].tryEvaluate(state));

        if (!error) {
            if (Array.isArray(arr) || typeof arr === 'string') {
                let start: number;

                const startExpr: Expression = expression.children[1];
                ({ value: start, error } = startExpr.tryEvaluate(state));
                if (!error && !Number.isInteger(start)) {
                    error = `${ startExpr } is not an integer.`;
                } else if (start < 0 || start >= arr.length) {
                    error = `${ startExpr }=${ start } which is out of range for ${ arr }`;
                }
                if (!error) {
                    result = arr.slice(0, start);
                }
            } else {
                error = `${ expression.children[0] } is not array or string.`;
            }
        }

        return { value: result, error };
    }

    private static subArray(expression: Expression, state: any): { value: any; error: string } {
        let result: any;
        let error: any;
        let arr: any;
        ({ value: arr, error } = expression.children[0].tryEvaluate(state));

        if (!error) {
            if (Array.isArray(arr)) {
                let start: number;

                const startExpr: Expression = expression.children[1];
                ({ value: start, error } = startExpr.tryEvaluate(state));
                if (!error && !Number.isInteger(start)) {
                    error = `${ startExpr } is not an integer.`;
                } else if (start < 0 || start >= arr.length) {
                    error = `${ startExpr }=${ start } which is out of range for ${ arr }`;
                }
                if (!error) {
                    let end: number;
                    if (expression.children.length === 2) {
                        end = arr.length;
                    } else {
                        const endExpr: Expression = expression.children[2];
                        ({ value: end, error } = endExpr.tryEvaluate(state));
                        if (!error && !Number.isInteger(end)) {
                            error = `${ endExpr } is not an integer`;
                        } else if (end < 0 || end > arr.length) {
                            error = `${ endExpr }=${ end } which is out of range for ${ arr }`;
                        }
                    }
                    if (!error) {
                        result = arr.slice(start, end);
                    }
                }
            } else {
                error = `${ expression.children[0] } is not array.`;
            }
        }

        return { value: result, error };
    }

    private static sortBy(isDescending: boolean): EvaluateExpressionDelegate {
        return (expression: Expression, state: any): { value: any; error: string } => {
            let result: any;
            let error: string;
            let oriArr: any;
            ({ value: oriArr, error } = expression.children[0].tryEvaluate(state));
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
                        ({value: propertyName, error} = expression.children[1].tryEvaluate(state));

                        if (!error) {
                            propertyName = propertyName === undefined ? '' : propertyName;
                        }
                        if (isDescending) {
                            result = lodash.sortBy(arr, propertyName).reverse();
                        } else {
                            result = lodash.sortBy(arr, propertyName);
                        }
                    }
                } else {
                    error = `${ expression.children[0] } is not array`;
                }

            }

            return { value: result, error };
        };
    }

    private static indicesAndValues(expression: Expression, state: any): {value: any; error: string} {
        let result: object = undefined;
        let error: string = undefined;
        let value: any = undefined;
        ({value, error} = expression.children[0].tryEvaluate(state));
        if (error === undefined) {
            if (Array.isArray(value)) {
                const tempList = [];
                for (let i = 0; i < value.length; i++) {
                    tempList.push({index: i, value: value[i]});
                }

                result = tempList;
            } else {
                error = `${ expression.children[0] } is not array.`;
            }
        }

        return {value: result, error};
    } 

    private static toBinary(stringToConvert: string): string {
        let result = '';
        for (const element of stringToConvert) {
            const binaryElement: string = element.charCodeAt(0).toString(2);
            // tslint:disable-next-line: prefer-array-literal
            result += new Array(9 - binaryElement.length).join('0').concat(binaryElement);
        }

        return result;
    }

    // DateTime Functions
    private static addToTime(timeStamp: string, interval: number, timeUnit: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: any;
        ({value: parsed, error} = ExpressionFunctions.parseTimestamp(timeStamp));
        if (!error) {
            let addedTime: moment.Moment = parsed;
            let timeUnitMark: string;
            switch (timeUnit) {
                case 'Second': {
                    timeUnitMark = 's';
                    break;
                }

                case 'Minute': {
                    timeUnitMark = 'm';
                    break;
                }

                case 'Hour': {
                    timeUnitMark = 'h';
                    break;
                }

                case 'Day': {
                    timeUnitMark = 'd';
                    break;
                }

                case 'Week': {
                    timeUnitMark = 'week';
                    break;
                }

                case 'Month': {
                    timeUnitMark = 'month';
                    break;
                }

                case 'Year': {
                    timeUnitMark = 'year';
                    break;
                }

                default: {
                    error = `${ timeUnit } is not valid time unit`;
                    break;
                }
            }

            if (!error) {
                addedTime = parsed.add(interval, timeUnitMark);
                ({value: result, error} = this.returnFormattedTimeStampStr(addedTime, format));
            }
        }

        return {value: result, error};
    }

    private static returnFormattedTimeStampStr(timedata: moment.Moment, format: string): {value: any; error: string } {
        let result: string;
        let error: string;
        try {
            result = timedata.format(format);
        } catch (e) {
            error = `${ format } is not a valid timestamp format`;
        }

        return {value: result, error};
    }

    private static convertFromUTC(timeStamp: string, destinationTimeZone: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        error = this.verifyISOTimestamp(timeStamp);
        const timeZone: string = TimeZoneConverter.windowsToIana(destinationTimeZone);
        if (!TimeZoneConverter.verifyTimeZoneStr(timeZone)) {
            error = `${ destinationTimeZone } is not a valid timezone`;
        }

        if (!error) {
            try {
                result = timezone.tz(timeStamp, timeZone).format(format);
            } catch (e) {
                error = `${ format } is not a valid timestamp format`;
            }
        }

        return {value: result, error};
    }

    private static verifyTimeStamp(timeStamp: string): string {
        let parsed: any;
        let error: string;
        parsed = moment(timeStamp);
        if (parsed.toString() === 'Invalid date') {
            error = `${ timeStamp } is a invalid datetime`;
        }

        return error;
    }

    private static convertToUTC(timeStamp: string, sourceTimezone: string, format?: string):  {value: any; error: string} {
        let result: string;
        let error: string;
        let formattedSourceTime: string;
        const timeZone: string = TimeZoneConverter.windowsToIana(sourceTimezone);
        if (!TimeZoneConverter.verifyTimeZoneStr(timeZone)) {
            error = `${ sourceTimezone } is not a valid timezone`;
        }

        if (!error) {
            error = this.verifyTimeStamp(timeStamp);
            if (!error) {
                try {
                    const sourceTime: moment.Moment = timezone.tz(timeStamp, timeZone);
                    formattedSourceTime = sourceTime.format();
                } catch (e) {
                    error = `${ timeStamp } with ${ timeZone } is not a valid timestamp with specified timeZone:`;
                }

                if (!error) {
                    try {
                        result = timezone.tz(formattedSourceTime, 'Etc/UTC').format(format);
                    } catch (e) {
                        error = `${ format } is not a valid timestamp format`;
                    }
                }
            }
        }

        return {value: result, error};
    }

    private static ticks(timeStamp: string): {value: any; error: string} {
        let parsed: any;
        let result: number;
        let error: string;
        ({value: parsed, error} = ExpressionFunctions.parseTimestamp(timeStamp));
        if (!error) {
            const unixMilliSec: number = parseInt(parsed.format('x'), 10);
            result = this.UnixMilliSecondToTicksConstant + unixMilliSec * 10000;
        }

        return {value: result, error};
    }

    private static startOfDay(timeStamp: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: moment.Moment;
        ({value: parsed, error} = ExpressionFunctions.parseTimestamp(timeStamp));
        if (!error) {
            const startOfDay: moment.Moment = parsed.hours(0).minutes(0).second(0).millisecond(0);
            ({value: result, error} =  ExpressionFunctions.returnFormattedTimeStampStr(startOfDay, format));
        }

        return {value: result, error};
    }

    private static startOfHour(timeStamp: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: moment.Moment;
        ({value: parsed, error} = ExpressionFunctions.parseTimestamp(timeStamp));
        if (!error) {
            const startofHour: moment.Moment = parsed.minutes(0).second(0).millisecond(0);
            ({value: result, error} =  ExpressionFunctions.returnFormattedTimeStampStr(startofHour, format));
        }

        return {value: result, error};
    }

    private static startOfMonth(timeStamp: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: moment.Moment;
        ({value: parsed, error} = ExpressionFunctions.parseTimestamp(timeStamp));
        if (!error) {
            const startofMonth: moment.Moment = parsed.date(1).hours(0).minutes(0).second(0).millisecond(0);
            ({value: result, error} =  ExpressionFunctions.returnFormattedTimeStampStr(startofMonth, format));
        }

        return {value: result, error};
    }

    // Uri Parsing Function
    private static parseUri(uri: string): {value: any; error: string} {
        let result: URL;
        let error: string;
        try {
            result = new URL(uri);
        } catch (e) {
            error = `Invalid URI: ${ uri }`;
        }

        return {value: result, error};
    }

    private static uriHost(uri: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: URL;
        ({value: parsed, error} = this.parseUri(uri));
        if (!error) {
            try {
                result = parsed.hostname;
            } catch (e) {
                error = 'invalid operation, input uri should be an absolute URI';
            }
        }

        return {value: result, error};
    }

    private static uriPath(uri: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: URL;
        ({value: parsed, error} = this.parseUri(uri));
        if (!error) {
            try {
                const uriObj: URL = new URL(uri);
                result = uriObj.pathname;
            } catch (e) {
                error = 'invalid operation, input uri should be an absolute URI';
            }
        }

        return {value: result, error};
    }

    private static uriPathAndQuery(uri: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: URL;
        ({value: parsed, error} = this.parseUri(uri));
        if (!error) {
            try {
                result = parsed.pathname + parsed.search;
            } catch (e) {
                error = 'invalid operation, input uri should be an absolute URI';
            }
        }

        return {value: result, error};
    }

    private static uriPort(uri: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: URL;
        ({value: parsed, error} = this.parseUri(uri));
        if (!error) {
            try {
                result = parsed.port;
            } catch (e) {
                error = 'invalid operation, input uri should be an absolute URI';
            }
        }

        return {value: result, error};
    }

    private static uriQuery(uri: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: URL;
        ({value: parsed, error} = this.parseUri(uri));
        if (!error) {
            try {
                result = parsed.search;
            } catch (e) {
                error = 'invalid operation, input uri should be an absolute URI';
            }
        }

        return {value: result, error};
    }

    private static uriScheme(uri: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: URL;
        ({value: parsed, error} = this.parseUri(uri));
        if (!error) {
            try {
                result = parsed.protocol.replace(':', '');
            } catch (e) {
                error = 'invalid operation, input uri should be an absolute URI';
            }
        }

        return {value: result, error};
    }

    private static isEqual(args: any []): boolean {
        if (args.length === 0 ) {
            return false;
        }

        if (args[0] === undefined || args[0] === null) {
            return args[1] === undefined || args[1] === null;
        }

        if (Array.isArray(args[0]) && args[0].length === 0 && Array.isArray(args[1]) && args[1].length === 0) {
            return true;
        }

        if (ExpressionFunctions.getPropertyCount(args[0]) === 0 && ExpressionFunctions.getPropertyCount(args[1]) === 0) {
            return true;
        }

        try
        {
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

    // tslint:disable-next-line: max-func-body-length
    private static buildFunctionLookup(): Map<string, ExpressionEvaluator> {
        // tslint:disable-next-line: no-unnecessary-local-variable
        const functions: ExpressionEvaluator[] = [
            //Math
            new ExpressionEvaluator(ExpressionType.Element, ExpressionFunctions.extractElement, ReturnType.Object, this.validateBinary),
            ExpressionFunctions.multivariateNumeric(ExpressionType.Subtract, (args: any []): number => Number(args[0]) - Number(args[1])),
            ExpressionFunctions.multivariateNumeric(ExpressionType.Multiply, (args: any []): number => Number(args[0]) * Number(args[1])),
            ExpressionFunctions.multivariateNumeric(
                ExpressionType.Divide,
                (args: any []): number => Math.floor(Number(args[0]) / Number(args[1])),
                (val: any, expression: Expression, pos: number): string => {
                    let error: string = this.verifyNumber(val, expression, pos);
                    if (!error && (pos > 0 && Number(val) === 0)) {
                        error = `Cannot divide by 0 from ${ expression }`;
                    }

                    return error;
                }),
            ExpressionFunctions.numericOrNumericList(ExpressionType.Min, (args: any []): number => {
                let result = Number.POSITIVE_INFINITY;
                if (args.length === 1) {
                    if (Array.isArray(args[0])) {
                        for (const value of args[0]) {
                            result = Math.min(result, value);
                        }
                    } else {
                        result =  Math.min(result, args[0]);
                    }
                } else {
                    for (const arg of args) {
                        if (Array.isArray(arg)) {
                            for (const value of arg) {
                                result = Math.min(result, value);
                            }
                        } else {
                            result =  Math.min(result, arg);
                        }
                    }
                }

                return result;
            }),
            ExpressionFunctions.numericOrNumericList(ExpressionType.Max, (args: any []): number => {
                let result = Number.NEGATIVE_INFINITY;
                if (args.length === 1) {
                    if (Array.isArray(args[0])) {
                        for (const value of args[0]) {
                            result = Math.max(result, value);
                        }
                    } else {
                        result =  Math.max(result, args[0]);
                    }
                } else {
                    for (const arg of args) {
                        if (Array.isArray(arg)) {
                            for (const value of arg) {
                                result = Math.max(result, value);
                            }
                        } else {
                            result =  Math.max(result, arg);
                        }
                    }
                }

                return result;
            }),
            ExpressionFunctions.multivariateNumeric(ExpressionType.Power, (args: any []): number => Math.pow(args[0], args[1])),
            new ExpressionEvaluator(
                ExpressionType.Mod,
                ExpressionFunctions.applyWithError(
                    (args: any []): any => {
                        let error: string;
                        let value: any;
                        if (Number(args[1]) === 0) {
                            error = (`Cannot mod by 0.`);
                        } else {
                            value = args[0] % args[1];
                        }

                        return { value, error };
                    },
                    ExpressionFunctions.verifyInteger),
                ReturnType.Number,
                ExpressionFunctions.validateBinaryNumber),
            new ExpressionEvaluator(
                ExpressionType.Average,
                ExpressionFunctions.apply(
                    (args: any []): number => args[0].reduce((x: number, y: number): number => x + y) / args[0].length,
                    ExpressionFunctions.verifyNumericList),
                ReturnType.Number,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Sum,
                ExpressionFunctions.apply(
                    (args: any []): number => args[0].reduce((x: number, y: number): number => x + y),
                    ExpressionFunctions.verifyNumericList),
                ReturnType.Number,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Add,
                ExpressionFunctions.applySequenceWithError(
                    (args: any []): any => {
                        let value: any;
                        let error: string;
                        const stringConcat = !ExpressionFunctions.isNumber(args[0]) || !ExpressionFunctions.isNumber(args[1]);
                        if (((args[0] === null || args[0] === undefined) && ExpressionFunctions.isNumber(args[1]))
                                || ((args[1] === null || args[1] === undefined) && ExpressionFunctions.isNumber(args[0])))
                        {
                            error = 'Operator \'+\' or add cannot be applied to operands of type \'number\' and null object.';
                        }
                        else if (stringConcat) {
                            if ((args[0] === null || args[0] === undefined) && (args[1] === null || args[1] === undefined)) {
                                value = '';
                            } else if (args[0] === null || args[0] === undefined) {
                                value = args[1].toString();
                            } else if (args[1] === null || args[1] === undefined) {
                                value = args[0].toString();
                            } else {
                                value = args[0].toString() + args[1].toString();
                            }
                        } else {
                            value = args[0] + args[1];
                        }

                        return {value, error};
                    },
                    ExpressionFunctions.verifyNumberOrStringOrNull),
                ReturnType.Object,
                (expression: Expression): void =>  ExpressionFunctions.validateArityAndAnyType(expression, 2, Number.MAX_SAFE_INTEGER)),
            new ExpressionEvaluator(
                ExpressionType.Count,
                ExpressionFunctions.apply(
                    (args: any []): number => {
                        let count: number;
                        if (typeof args[0] === 'string' || Array.isArray(args[0])) {
                            count = args[0].length;
                        }

                        if (args[0] instanceof Map) {
                            count = args[0].size;
                        }

                        return count;
                    },
                    ExpressionFunctions.verifyContainer),
                ReturnType.Number,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Range,
                ExpressionFunctions.applyWithError(
                    (args: any []): any => {
                        let error: string;
                        if (args[1] <= 0) {
                            error = 'Second paramter must be more than zero';
                        }

                        // tslint:disable-next-line: prefer-array-literal
                        const result: number[] = [...Array(args[1]).keys()].map((u: number): number => u + Number(args[0]));

                        return { value: result, error };
                    },
                    ExpressionFunctions.verifyInteger
                ),
                ReturnType.Object,
                ExpressionFunctions.validateBinaryNumber
            ),
            new ExpressionEvaluator(
                ExpressionType.Union,
                ExpressionFunctions.apply(
                    (args: any []): any => {
                        let result: any[] = [];
                        for (const arg of args) {
                            result = result.concat(arg);
                        }

                        return Array.from(new Set(result));
                    },
                    ExpressionFunctions.verifyList),
                ReturnType.Object,
                ExpressionFunctions.validateAtLeastOne
            ),
            new ExpressionEvaluator(
                ExpressionType.Intersection,
                ExpressionFunctions.apply(
                    (args: any []): any => {
                        let result: any[] = args[0];
                        for (const arg of args) {
                            result = result.filter((e: any): boolean => arg.indexOf(e) > -1);
                        }

                        return Array.from(new Set(result));
                    },
                    ExpressionFunctions.verifyList),
                ReturnType.Object,
                ExpressionFunctions.validateAtLeastOne
            ),
            new ExpressionEvaluator(
                ExpressionType.Skip,
                ExpressionFunctions.skip,
                ReturnType.Object,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [], ReturnType.Object, ReturnType.Number)
            ),
            new ExpressionEvaluator(
                ExpressionType.Take,
                ExpressionFunctions.take,
                ReturnType.Object,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [], ReturnType.Object, ReturnType.Number)
            ),
            new ExpressionEvaluator(
                ExpressionType.SubArray,
                ExpressionFunctions.subArray,
                ReturnType.Object,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.Number], ReturnType.Object, ReturnType.Number)
            ),
            new ExpressionEvaluator(
                ExpressionType.SortBy,
                ExpressionFunctions.sortBy(false),
                ReturnType.Object,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.String], ReturnType.Object)
            ),
            new ExpressionEvaluator(
                ExpressionType.SortByDescending,
                ExpressionFunctions.sortBy(true),
                ReturnType.Object,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.String], ReturnType.Object)
            ),
            new ExpressionEvaluator(ExpressionType.IndicesAndValues, 
                (expression: Expression, state: any): {value: any; error: string} => ExpressionFunctions.indicesAndValues(expression, state), 
                ReturnType.Object, ExpressionFunctions.validateUnary),
            ExpressionFunctions.comparison(
                ExpressionType.LessThan,
                (args: any []): boolean => args[0] < args[1], ExpressionFunctions.validateBinaryNumberOrString, ExpressionFunctions.verifyNumberOrString),
            ExpressionFunctions.comparison(
                ExpressionType.LessThanOrEqual,
                (args: any []): boolean => args[0] <= args[1], ExpressionFunctions.validateBinaryNumberOrString, ExpressionFunctions.verifyNumberOrString),
            ExpressionFunctions.comparison(
                ExpressionType.Equal,
                this.isEqual, ExpressionFunctions.validateBinary),
            ExpressionFunctions.comparison(
                ExpressionType.NotEqual,
                (args: any []): boolean => !this.isEqual(args), ExpressionFunctions.validateBinary),
            ExpressionFunctions.comparison(
                ExpressionType.GreaterThan,
                (args: any []): boolean => args[0] > args[1], ExpressionFunctions.validateBinaryNumberOrString, ExpressionFunctions.verifyNumberOrString),
            ExpressionFunctions.comparison(
                ExpressionType.GreaterThanOrEqual,
                (args: any []): boolean => args[0] >= args[1], ExpressionFunctions.validateBinaryNumberOrString, ExpressionFunctions.verifyNumberOrString),
            ExpressionFunctions.comparison(
                ExpressionType.Exists,
                (args: any []): boolean => args[0] !== undefined, ExpressionFunctions.validateUnary, ExpressionFunctions.verifyNumberOrString),
            new ExpressionEvaluator(
                ExpressionType.Contains,
                (expression: Expression, state: any): { value: any; error: string } => {
                    let found = false;
                    let error: any;
                    let args: any [];
                    ({ args, error } = ExpressionFunctions.evaluateChildren(expression, state));

                    if (!error) {
                        if (typeof args[0] === 'string' && typeof args[1] === 'string' || Array.isArray(args[0])) {
                            found = args[0].includes(args[1]);
                        } else if (args[0] instanceof Map) {
                            found = (args[0] as Map<string, any>).get(args[1]) !== undefined;
                        } else if (typeof args[1] === 'string') {
                            let value: any;
                            ({ value, error } = Extensions.accessProperty(args[0], args[1]));
                            found = !error && value !== undefined;
                        }
                    }

                    return { value: found, error: undefined };
                },
                ReturnType.Boolean,
                ExpressionFunctions.validateBinary),
            ExpressionFunctions.comparison(
                ExpressionType.Empty,
                (args: any []): boolean => this.isEmpty(args[0]),
                ExpressionFunctions.validateUnary,
                ExpressionFunctions.verifyNumberOrString),
            new ExpressionEvaluator(
                ExpressionType.And,
                (expression: Expression, state: MemoryInterface): { value: any; error: string } => ExpressionFunctions._and(expression, state),
                ReturnType.Boolean,
                ExpressionFunctions.validateAtLeastOne),
            new ExpressionEvaluator(
                ExpressionType.Or,
                (expression: Expression, state: MemoryInterface): { value: any; error: string } => ExpressionFunctions._or(expression, state),
                ReturnType.Boolean,
                ExpressionFunctions.validateAtLeastOne),
            new ExpressionEvaluator(
                ExpressionType.Not,
                (expression: Expression, state: MemoryInterface): { value: any; error: string } => ExpressionFunctions._not(expression, state),
                ReturnType.Boolean,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Concat,
                ExpressionFunctions.apply((args: any []): string => {
                    let result = '';
                    for (const arg of args) {
                        if (arg !== undefined && arg !== null) {
                            result += arg.toString();
                        }
                    }

                    return result;
                }),
                ReturnType.String,
                ExpressionFunctions.validateAtLeastOne),
            new ExpressionEvaluator(
                ExpressionType.Length,
                ExpressionFunctions.apply((args: any []): number => (ExpressionFunctions.parseStringOrNull(args[0])).length, ExpressionFunctions.verifyStringOrNull),
                ReturnType.Number,
                ExpressionFunctions.validateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.Replace,
                ExpressionFunctions.applyWithError((
                    args: any []): any => 
                {
                    let error = undefined;
                    let result = undefined;
                    if (ExpressionFunctions.parseStringOrNull(args[1]).length === 0) {
                        error = `${ args[1] } should be a string with length at least 1`;
                    }

                    if (!error) {
                        result = ExpressionFunctions.parseStringOrNull(args[0]).split(ExpressionFunctions.parseStringOrNull(args[1])).join(ExpressionFunctions.parseStringOrNull(args[2]));
                    }

                    return {value: result, error};
                }, ExpressionFunctions.verifyStringOrNull),
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 3, 3, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.ReplaceIgnoreCase,
                ExpressionFunctions.applyWithError((
                    args: any []): any => 
                {
                    let error = undefined;
                    let result = undefined;
                    if (ExpressionFunctions.parseStringOrNull(args[1]).length === 0) {
                        error = `${ args[1] } should be a string with length at least 1`;
                    }

                    if (!error) {
                        result = ExpressionFunctions.parseStringOrNull(args[0]).replace(new RegExp(ExpressionFunctions.parseStringOrNull(args[1]), 'gi'), ExpressionFunctions.parseStringOrNull(args[2]));
                    }

                    return {value: result, error};
                }, ExpressionFunctions.verifyStringOrNull),
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 3, 3, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.Split,
                ExpressionFunctions.apply((args: any []): string[] => ExpressionFunctions.parseStringOrNull(args[0]).split(ExpressionFunctions.parseStringOrNull(args[1]? args[1]: '')), ExpressionFunctions.verifyStringOrNull),
                ReturnType.Object,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 1, 2, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.Substring,
                ExpressionFunctions.substring,
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.Number], ReturnType.String, ReturnType.Number)),
            ExpressionFunctions.stringTransform(ExpressionType.ToLower, (args: any []): string => String(ExpressionFunctions.parseStringOrNull(args[0])).toLowerCase()),
            ExpressionFunctions.stringTransform(ExpressionType.ToUpper, (args: any []): string => String(ExpressionFunctions.parseStringOrNull(args[0])).toUpperCase()),
            ExpressionFunctions.stringTransform(ExpressionType.Trim, (args: any []): string => String(ExpressionFunctions.parseStringOrNull(args[0])).trim()),
            new ExpressionEvaluator(
                ExpressionType.StartsWith,
                ExpressionFunctions.apply((args: any []): boolean => ExpressionFunctions.parseStringOrNull(args[0]).startsWith(ExpressionFunctions.parseStringOrNull(args[1])), ExpressionFunctions.verifyStringOrNull),
                ReturnType.Boolean,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 2, 2, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.EndsWith,
                ExpressionFunctions.apply((args: any []): boolean => ExpressionFunctions.parseStringOrNull(args[0]).endsWith(ExpressionFunctions.parseStringOrNull(args[1])), ExpressionFunctions.verifyStringOrNull),
                ReturnType.Boolean,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 2, 2, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.CountWord,
                ExpressionFunctions.apply((args: any []): number => ExpressionFunctions.parseStringOrNull(args[0]).trim().split(/\s+/).length, ExpressionFunctions.verifyStringOrNull),
                ReturnType.Number,
                ExpressionFunctions.validateUnaryString
            ),
            new ExpressionEvaluator(
                ExpressionType.AddOrdinal,
                ExpressionFunctions.apply((args: any []): string => this.addOrdinal(args[0]), ExpressionFunctions.verifyInteger),
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 1, 1, ReturnType.Number)
            ),
            new ExpressionEvaluator(
                ExpressionType.NewGuid,
                ExpressionFunctions.apply((): string => ExpressionFunctions.newGuid()),
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 0, 0)
            ),
            new ExpressionEvaluator(
                ExpressionType.IndexOf,
                ExpressionFunctions.apply((args: any []): number => ExpressionFunctions.parseStringOrNull(args[0]).indexOf(ExpressionFunctions.parseStringOrNull(args[1])), ExpressionFunctions.verifyStringOrNull),
                ReturnType.Number,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 2, 2, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.LastIndexOf,
                ExpressionFunctions.apply((args: any []): number => ExpressionFunctions.parseStringOrNull(args[0]).lastIndexOf(ExpressionFunctions.parseStringOrNull(args[1])), ExpressionFunctions.verifyStringOrNull),
                ReturnType.Number,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 2, 2, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.Join,
                (expression: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: any [];
                    ({ args, error } = ExpressionFunctions.evaluateChildren(expression, state));
                    if (!error) {
                        if (!Array.isArray(args[0])) {
                            error = `${ expression.children[0] } evaluates to ${ args[0] } which is not a list.`;
                        } else {
                            if (args.length === 2) {
                                value = args[0].join(args[1]);
                            } else {
                                if (args[0].length < 3) {
                                    value = args[0].join(args[2]);
                                } else {
                                    const firstPart: string = args[0].slice(0, args[0].length - 1).join(args[1]);
                                    value = firstPart.concat(args[2], args[0][args[0].length - 1]);
                                }
                            }
                        }
                    }

                    return { value, error };
                },
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.String], ReturnType.Object, ReturnType.String)),
            // datetime
            ExpressionFunctions.timeTransform(ExpressionType.AddDays, (ts: moment.Moment, num: any): any => ts.add(num, 'd')),
            ExpressionFunctions.timeTransform(ExpressionType.AddHours, (ts: moment.Moment, num: any): any => ts.add(num, 'h')),
            ExpressionFunctions.timeTransform(ExpressionType.AddMinutes, (ts: moment.Moment, num: any): any => ts.add(num, 'minutes')),
            ExpressionFunctions.timeTransform(ExpressionType.AddSeconds, (ts: moment.Moment, num: any): any => ts.add(num, 'seconds')),
            new ExpressionEvaluator(
                ExpressionType.DayOfMonth,
                ExpressionFunctions.applyWithError(
                    (args: any []): any => ExpressionFunctions.parseTimestamp(args[0], (dt: moment.Moment): number => dt.date()),
                    ExpressionFunctions.verifyString),
                ReturnType.Number,
                ExpressionFunctions.validateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.DayOfWeek,
                ExpressionFunctions.applyWithError(
                    (args: any []): any => ExpressionFunctions.parseTimestamp(args[0], (dt: moment.Moment): number => dt.days()),
                    ExpressionFunctions.verifyString),
                ReturnType.Number,
                ExpressionFunctions.validateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.DayOfYear,
                ExpressionFunctions.applyWithError(
                    (args: any []): any => ExpressionFunctions.parseTimestamp(args[0], (dt: moment.Moment): number => dt.dayOfYear()),
                    ExpressionFunctions.verifyString),
                ReturnType.Number,
                ExpressionFunctions.validateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.Month,
                ExpressionFunctions.applyWithError(
                    (args: any []): any => ExpressionFunctions.parseTimestamp(args[0], (dt: moment.Moment): number => dt.month() + 1),
                    ExpressionFunctions.verifyString),
                ReturnType.Number,
                ExpressionFunctions.validateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.Date,
                ExpressionFunctions.applyWithError(
                    (args: any []): any => ExpressionFunctions.parseTimestamp(args[0], (dt: moment.Moment): string => dt.format('M/DD/YYYY')),
                    ExpressionFunctions.verifyString),
                ReturnType.String,
                ExpressionFunctions.validateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.Year,
                ExpressionFunctions.applyWithError(
                    (args: any []): any => ExpressionFunctions.parseTimestamp(args[0], (dt: moment.Moment): number => dt.year()),
                    ExpressionFunctions.verifyString),
                ReturnType.Number,
                ExpressionFunctions.validateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.UtcNow,
                ExpressionFunctions.apply(
                    (args: any []): string => args.length === 1 ? moment(new Date().toISOString()).utc().format(args[0]) : new Date().toISOString(),
                    ExpressionFunctions.verifyString),
                ReturnType.String),
            new ExpressionEvaluator(
                ExpressionType.FormatDateTime,
                ExpressionFunctions.applyWithError(
                    (args: any []): any => {
                        let error: string;
                        let arg: any = args[0];
                        if (typeof arg === 'number') {
                            arg = arg * 1000;
                        } else {
                            error = ExpressionFunctions.verifyTimestamp(arg.toString());
                        }

                        let value: any;
                        if (!error) {
                            const dateString: string = new Date(arg).toISOString();
                            value = args.length === 2 ? moment(dateString).format(ExpressionFunctions.timestampFormatter(args[1])) : dateString;
                        }

                        return { value, error };
                    }),
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.String], ReturnType.Object)),
            new ExpressionEvaluator(
                ExpressionType.SubtractFromTime,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: any;
                    let args: any [];
                    ({ args, error } = ExpressionFunctions.evaluateChildren(expr, state));
                    if (!error) {
                        if (typeof args[0] === 'string' && Number.isInteger(args[1]) && typeof args[2] === 'string') {
                            const format: string = (args.length === 4 ? ExpressionFunctions.timestampFormatter(args[3]) : ExpressionFunctions.DefaultDateTimeFormat);
                            const { duration, tsStr } = ExpressionFunctions.timeUnitTransformer(args[1], args[2]);
                            if (tsStr === undefined) {
                                error = `${ args[2] } is not a valid time unit.`;
                            } else {
                                const dur: any = duration;
                                ({ value, error } = ExpressionFunctions.parseTimestamp(args[0], (dt: moment.Moment): string => args.length === 4 ?
                                    dt.subtract(dur, tsStr).format(format) : dt.subtract(dur, tsStr).toISOString()));
                            }
                        } else {
                            error = `${ expr } can't evaluate.`;
                        }
                    }

                    return { value, error };
                },
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.String], ReturnType.String, ReturnType.Number, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.DateReadBack,
                ExpressionFunctions.applyWithError(
                    (args: any []): any => {
                        let value: any;
                        let error: string;
                        const dateFormat = 'YYYY-MM-DD';
                        ({ value, error } = ExpressionFunctions.parseTimestamp(args[0]));
                        if (!error) {
                            const timestamp1: Date = new Date(value.format(dateFormat));
                            ({ value, error } = ExpressionFunctions.parseTimestamp(args[1]));
                            const timestamp2: string = value.format(dateFormat);
                            const timex: TimexProperty = new TimexProperty(timestamp2);

                            return { value: timex.toNaturalLanguage(timestamp1), error };
                        }
                    },
                    ExpressionFunctions.verifyString),
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, undefined, ReturnType.String, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.GetTimeOfDay,
                ExpressionFunctions.applyWithError(
                    (args: any []): any => {
                        let value: any;
                        const error: string = ExpressionFunctions.verifyISOTimestamp(args[0]);
                        if (!error) {
                            const thisTime: number = moment.parseZone(args[0]).hour() * 100 + moment.parseZone(args[0]).minute();
                            if (thisTime === 0) {
                                value = 'midnight';
                            } else if (thisTime > 0 && thisTime < 1200) {
                                value = 'morning';
                            } else if (thisTime === 1200) {
                                value = 'noon';
                            } else if (thisTime > 1200 && thisTime < 1800) {
                                value = 'afternoon';
                            } else if (thisTime >= 1800 && thisTime <= 2200) {
                                value = 'evening';
                            } else if (thisTime > 2200 && thisTime <= 2359) {
                                value = 'night';
                            }
                        }

                        return { value, error };
                    },
                    this.verifyString),
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, undefined, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.GetFutureTime,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: any;
                    let args: any [];
                    ({ args, error } = ExpressionFunctions.evaluateChildren(expr, state));
                    if (!error) {
                        if (Number.isInteger(args[0]) && typeof args[1] === 'string') {
                            const format: string = (args.length === 3 ? ExpressionFunctions.timestampFormatter(args[2]) : ExpressionFunctions.DefaultDateTimeFormat);
                            const { duration, tsStr } = ExpressionFunctions.timeUnitTransformer(args[0], args[1]);
                            if (tsStr === undefined) {
                                error = `${ args[2] } is not a valid time unit.`;
                            } else {
                                const dur: any = duration;
                                ({ value, error } = ExpressionFunctions.parseTimestamp(new Date().toISOString(), (dt: moment.Moment): string => dt.add(dur, tsStr).format(format)));
                            }
                        } else {
                            error = `${ expr } can't evaluate.`;
                        }
                    }

                    return { value, error };
                },
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.String], ReturnType.Number, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.GetPastTime,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: any;
                    let args: any [];
                    ({ args, error } = ExpressionFunctions.evaluateChildren(expr, state));
                    if (!error) {
                        if (Number.isInteger(args[0]) && typeof args[1] === 'string') {
                            const format: string = (args.length === 3 ? ExpressionFunctions.timestampFormatter(args[2]) : ExpressionFunctions.DefaultDateTimeFormat);
                            const { duration, tsStr } = ExpressionFunctions.timeUnitTransformer(args[0], args[1]);
                            if (tsStr === undefined) {
                                error = `${ args[2] } is not a valid time unit.`;
                            } else {
                                const dur: any = duration;
                                ({ value, error } = ExpressionFunctions.parseTimestamp(new Date().toISOString(), (dt: moment.Moment): string => dt.subtract(dur, tsStr).format(format)));
                            }
                        } else {
                            error = `${ expr } can't evaluate.`;
                        }
                    }

                    return { value, error };
                },
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.String], ReturnType.Number, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.ConvertFromUTC,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: any [];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state));
                    if (!error) {
                        const format: string = (args.length === 3) ? ExpressionFunctions.timestampFormatter(args[2]) : this.DefaultDateTimeFormat;
                        if (typeof(args[0]) === 'string' && typeof(args[1]) === 'string') {
                            ({value, error} = ExpressionFunctions.convertFromUTC(args[0], args[1], format));
                        } else {
                            error = `${ expr } cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expr: Expression): void => ExpressionFunctions.validateOrder(expr, [ReturnType.String], ReturnType.String, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.ConvertToUTC,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: any [];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state));
                    if (!error) {
                        const format: string = (args.length === 3) ? ExpressionFunctions.timestampFormatter(args[2]) : this.DefaultDateTimeFormat;
                        if (typeof(args[0]) === 'string' && typeof(args[1]) === 'string') {
                            ({value, error} = ExpressionFunctions.convertToUTC(args[0], args[1], format));
                        } else {
                            error = `${ expr } cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expr: Expression): void => ExpressionFunctions.validateOrder(expr, [ReturnType.String], ReturnType.String, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.AddToTime,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: any [];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state));
                    if (!error) {
                        const format: string = (args.length === 4) ? ExpressionFunctions.timestampFormatter(args[3]) : this.DefaultDateTimeFormat;
                        if (typeof(args[0]) === 'string' && Number.isInteger(args[1]) && typeof(args[2]) === 'string') {
                            ({value, error} = ExpressionFunctions.addToTime(args[0], args[1], args[2], format));
                        } else {
                            error = `${ expr } cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expr: Expression): void => ExpressionFunctions.validateOrder(expr, [ReturnType.String], ReturnType.String, ReturnType.Number, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.StartOfDay,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: any [];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state));
                    if (!error) {
                        const format: string = (args.length === 2) ? ExpressionFunctions.timestampFormatter(args[1]) : this.DefaultDateTimeFormat;
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.startOfDay(args[0], format));
                        } else {
                            error = `${ expr } cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expr: Expression): void => ExpressionFunctions.validateOrder(expr, [ReturnType.String], ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.StartOfHour,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: any [];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state));
                    if (!error) {
                        const format: string = (args.length === 2) ? ExpressionFunctions.timestampFormatter(args[1]) : this.DefaultDateTimeFormat;
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.startOfHour(args[0], format));
                        } else {
                            error = `${ expr } cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expr: Expression): void => ExpressionFunctions.validateOrder(expr, [ReturnType.String], ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.StartOfMonth,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: any [];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state));
                    if (!error) {
                        const format: string = (args.length === 2) ? ExpressionFunctions.timestampFormatter(args[1]) : this.DefaultDateTimeFormat;
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.startOfMonth(args[0], format));
                        } else {
                            error = `${ expr } cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expr: Expression): void => ExpressionFunctions.validateOrder(expr, [ReturnType.String], ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.Ticks,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: any [];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state));
                    if (!error) {
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.ticks(args[0]));
                        } else {
                            error = `${ expr } cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.Number,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriHost,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: any [];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state));
                    if (!error) {
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.uriHost(args[0]));
                        } else {
                            error = `${ expr } cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriPath,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: any [];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state));
                    if (!error) {
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.uriPath(args[0]));
                        } else {
                            error = `${ expr } cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriPathAndQuery,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: any [];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state));
                    if (!error) {
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.uriPathAndQuery(args[0]));
                        } else {
                            error = `${ expr } cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriQuery,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: any [];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state));
                    if (!error) {
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.uriQuery(args[0]));
                        } else {
                            error = `${ expr } cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriPort,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: any [];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state));
                    if (!error) {
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.uriPort(args[0]));
                        } else {
                            error = `${ expr } cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.Number,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriScheme,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: any [];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state));
                    if (!error) {
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.uriScheme(args[0]));
                        } else {
                            error = `${ expr } cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Float,
                ExpressionFunctions.applyWithError(
                    (args: any []): any => {
                        let error: string;
                        const value: number = parseFloat(args[0]);
                        if (!ExpressionFunctions.isNumber(value)) {
                            error = `parameter ${ args[0] } is not a valid number string.`;
                        }

                        return { value, error };
                    }),
                ReturnType.Number, ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Int,
                ExpressionFunctions.applyWithError(
                    (args: any []): any => {
                        let error: string;
                        const value: number = parseInt(args[0], 10);
                        if (!ExpressionFunctions.isNumber(value)) {
                            error = `parameter ${ args[0] } is not a valid number string.`;
                        }

                        return { value, error };
                    }),
                ReturnType.Number,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.String,
                ExpressionFunctions.apply((args: any []): string => {
                    return JSON.stringify(args[0])
                        .replace(/(^\'*)/g, '')
                        .replace(/(\'*$)/g, '')
                        .replace(/(^\"*)/g, '')
                        .replace(/(\"*$)/g, '');
                }),
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            ExpressionFunctions.comparison(
                ExpressionType.Bool,
                (args: any []): boolean => this.isLogicTrue(args[0]),
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(ExpressionType.Accessor, ExpressionFunctions.accessor, ReturnType.Object, ExpressionFunctions.validateAccessor),
            new ExpressionEvaluator(
                ExpressionType.GetProperty,
                ExpressionFunctions.getProperty,
                ReturnType.Object,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, undefined, ReturnType.Object, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.If,
                (expression: Expression, state: MemoryInterface): { value: any; error: string } => ExpressionFunctions._if(expression, state),
                ReturnType.Object,
                (expr: Expression): void => ExpressionFunctions.validateArityAndAnyType(expr, 3, 3)),
            new ExpressionEvaluator(
                ExpressionType.Rand,
                ExpressionFunctions.applyWithError(
                    (args: any []): any => {
                        let error: string;
                        if (args[0] > args[1]) {
                            error = `Min value ${ args[0] } cannot be greater than max value ${ args[1] }.`;
                        }

                        // tslint:disable-next-line: insecure-random
                        const value: any = Math.floor(Math.random() * (Number(args[1]) - Number(args[0])) + Number(args[0]));

                        return { value, error };
                    },
                    ExpressionFunctions.verifyInteger),
                ReturnType.Number,
                ExpressionFunctions.validateBinaryNumber),
            new ExpressionEvaluator(ExpressionType.CreateArray, ExpressionFunctions.apply((args: any []): any[] => Array.from(args)), ReturnType.Object),
            new ExpressionEvaluator(
                ExpressionType.Array,
                ExpressionFunctions.apply((args: any []): any[] => [args[0]], ExpressionFunctions.verifyString),
                ReturnType.Object,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Binary,
                ExpressionFunctions.apply((args: any []): string => this.toBinary(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.DataUri,
                ExpressionFunctions.apply(
                    (args: Readonly<any>): string => 'data:text/plain;charset=utf-8;base64,'.concat(Buffer.from(args[0]).toString('base64')), ExpressionFunctions.verifyString),
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.DataUriToBinary,
                ExpressionFunctions.apply((args: Readonly<any>): string => this.toBinary(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.DataUriToString,
                // tslint:disable-next-line: restrict-plus-operands
                ExpressionFunctions.apply((args: Readonly<any>): string => Buffer.from(args[0].slice(args[0].indexOf(',') + 1), 'base64').toString(), ExpressionFunctions.verifyString),
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriComponentToString,
                ExpressionFunctions.apply((args: Readonly<any>): string => decodeURIComponent(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Base64,
                ExpressionFunctions.apply((args: Readonly<any>): string => Buffer.from(args[0]).toString('base64'), ExpressionFunctions.verifyString),
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Base64ToBinary,
                ExpressionFunctions.apply((args: Readonly<any>): string => this.toBinary(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Base64ToString,
                ExpressionFunctions.apply((args: Readonly<any>): string => Buffer.from(args[0], 'base64').toString(), ExpressionFunctions.verifyString),
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriComponent,
                ExpressionFunctions.apply((args: Readonly<any>): string => encodeURIComponent(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.First,
                ExpressionFunctions.apply(
                    (args: any []): any => {
                        let first: any;
                        if (typeof args[0] === 'string' && args[0].length > 0) {
                            first = args[0][0];
                        }

                        if (Array.isArray(args[0]) && args[0].length > 0) {
                            first = Extensions.accessIndex(args[0], 0).value;
                        }

                        return first;
                    }),
                ReturnType.Object,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Last,
                ExpressionFunctions.apply(
                    (args: any []): any => {
                        let last: any;
                        if (typeof args[0] === 'string' && args[0].length > 0) {
                            last = args[0][args[0].length - 1];
                        }

                        if (Array.isArray(args[0]) && args[0].length > 0) {
                            last = Extensions.accessIndex(args[0], args[0].length - 1).value;
                        }

                        return last;
                    }),
                ReturnType.Object,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Json,
                ExpressionFunctions.apply((args: any []): any => JSON.parse(args[0])),
                ReturnType.Object,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, undefined, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.AddProperty,
                ExpressionFunctions.apply(
                    (args: any []): any => {
                        const temp: any = args[0];
                        temp[String(args[1])] = args[2];

                        return temp;
                    }),
                ReturnType.Object,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, undefined, ReturnType.Object, ReturnType.String, ReturnType.Object)),
            new ExpressionEvaluator(
                ExpressionType.SetProperty,
                ExpressionFunctions.apply(
                    (args: any []): any => {
                        const temp: any = args[0];
                        temp[String(args[1])] = args[2];

                        return temp;
                    }),
                ReturnType.Object,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, undefined, ReturnType.Object, ReturnType.String, ReturnType.Object)),
            new ExpressionEvaluator(
                ExpressionType.RemoveProperty,
                ExpressionFunctions.apply(
                    (args: any []): any => {
                        const temp: any = args[0];
                        delete temp[String(args[1])];

                        return temp;
                    }),
                ReturnType.Object,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, undefined, ReturnType.Object, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.SetPathToValue,
                this.setPathToValue,
                ReturnType.Object,
                this.validateBinary),
            new ExpressionEvaluator(ExpressionType.Select, ExpressionFunctions.foreach, ReturnType.Object, ExpressionFunctions.validateForeach),
            new ExpressionEvaluator(ExpressionType.Foreach, ExpressionFunctions.foreach, ReturnType.Object, ExpressionFunctions.validateForeach),
            new ExpressionEvaluator(ExpressionType.Where, ExpressionFunctions.where, ReturnType.Object, ExpressionFunctions.validateWhere),

            //URI Parsing Functions
            new ExpressionEvaluator(ExpressionType.UriHost, ExpressionFunctions.applyWithError((args: Readonly<any>): any => this.uriHost(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String, ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(ExpressionType.UriPath, ExpressionFunctions.applyWithError((args: Readonly<any>): any => this.uriPath(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String, ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(ExpressionType.UriPathAndQuery,
                ExpressionFunctions.applyWithError((args: Readonly<any>): any => this.uriPathAndQuery(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String, ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(ExpressionType.UriQuery, ExpressionFunctions.applyWithError((args: Readonly<any>): any => this.uriQuery(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String, ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(ExpressionType.UriPort, ExpressionFunctions.applyWithError((args: Readonly<any>): any => this.uriPort(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String, ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(ExpressionType.UriScheme, ExpressionFunctions.applyWithError((args: Readonly<any>): any => this.uriScheme(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String, ExpressionFunctions.validateUnary),

            new ExpressionEvaluator(ExpressionType.Coalesce, ExpressionFunctions.apply((args: any [][]): any => this.coalesce(args as any[])),
                ReturnType.Object, ExpressionFunctions.validateAtLeastOne),
            new ExpressionEvaluator(ExpressionType.JPath, ExpressionFunctions.applyWithError((args: any [][]): any => this.jPath(args[0], args[1].toString())),
                ReturnType.Object, (expr: Expression): void => ExpressionFunctions.validateOrder(expr, undefined, ReturnType.Object, ReturnType.String)),

            // Regex expression functions
            new ExpressionEvaluator(
                ExpressionType.IsMatch,
                ExpressionFunctions.applyWithError(
                    (args: any []): any => {
                        let value = false;
                        let error: string;
                        if (args[0] === undefined || args[0] === '') {
                            value = false;
                            error = 'regular expression is empty.';
                        } else {
                            const regex: RegExp = CommonRegex.CreateRegex(args[1]);
                            value = regex.test(args[0]);
                        }

                        return {value, error};
                    }),
                ReturnType.Boolean,
                ExpressionFunctions.validateIsMatch)
        ];

        const lookup: Map<string, ExpressionEvaluator> = new Map<string, ExpressionEvaluator>();
        functions.forEach((func: ExpressionEvaluator): void => {
            lookup.set(func.type, func);
        });

        // Math aliases
        lookup.set('add', lookup.get(ExpressionType.Add)); // more than 1 param
        lookup.set('mul', lookup.get(ExpressionType.Multiply)); // more than 1 param
        lookup.set('div', lookup.get(ExpressionType.Divide)); // more than 1 param
        lookup.set('sub', lookup.get(ExpressionType.Subtract)); // more than 1 param
        lookup.set('exp', lookup.get(ExpressionType.Power)); // more than 1 param
        lookup.set('mod', lookup.get(ExpressionType.Mod));

        // Comparison aliases
        lookup.set('and', lookup.get(ExpressionType.And));
        lookup.set('equals', lookup.get(ExpressionType.Equal));
        lookup.set('greater', lookup.get(ExpressionType.GreaterThan));
        lookup.set('greaterOrEquals', lookup.get(ExpressionType.GreaterThanOrEqual));
        lookup.set('less', lookup.get(ExpressionType.LessThan));
        lookup.set('lessOrEquals', lookup.get(ExpressionType.LessThanOrEqual));
        lookup.set('not', lookup.get(ExpressionType.Not));
        lookup.set('or', lookup.get(ExpressionType.Or));
        lookup.set('&', lookup.get(ExpressionType.Concat));

        return lookup;
    }
}
