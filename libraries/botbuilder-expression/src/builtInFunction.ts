
/**
 * @module botbuilder-expression
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TimexProperty } from '@microsoft/recognizers-text-data-types-timex-expression';
import * as moment from 'moment';
import * as timezone from 'moment-timezone';
import { Builder } from 'xml2js';
import * as xmldom from 'xmldom';
import * as xpathEval from 'xpath';
import { CommonRegex } from './commonRegex';
import { Constant } from './constant';
import { Expression, ReturnType } from './expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator, ValidateExpressionDelegate } from './expressionEvaluator';
import { ExpressionType } from './expressionType';
import { Extensions } from './extensions';
import { TimeZoneConverter } from './timeZoneConverter';
import * as jsPath from 'jspath';

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
export class BuiltInFunctions {
    public static readonly DefaultDateTimeFormat: string = 'YYYY-MM-DDTHH:mm:ss.sssZ';
    public static readonly UnixMilliSecondToTicksConstant: number = 621355968000000000;  //constant of converting unix timestamp to ticks
    public static _functions: Map<string, ExpressionEvaluator> = BuiltInFunctions.BuildFunctionLookup();

    /**
     * Validate that expression has a certain number of children that are of any of the supported types.
     * @param expression Expression to validate.
     * @param minArity Minimum number of children.
     * @param maxArity Maximum number of children.
     * @param types Allowed return types for children.
     * If a child has a return type of Object then validation will happen at runtime.
     */
    public static ValidateArityAndAnyType(expression: Expression, minArity: number, maxArity: number, ...types: ReturnType[]): void {
        if (expression.Children.length < minArity) {
            throw new Error(`${expression} should have at least ${minArity} children.`);
        }
        if (expression.Children.length > maxArity) {
            throw new Error(`${expression} can't have more than ${maxArity} children.`);
        }

        if (types.length > 0) {
            for (const child of expression.Children) {

                if (child.ReturnType !== ReturnType.Object && !types.includes(child.ReturnType)) {
                    if (types.length === 1) {
                        throw new Error(`${child} is not a ${types[0]} expression in ${expression.toString()}.`);
                    } else {
                        const builder: string = `${child} in ${expression.toString()} is not any of [`;
                        let first: boolean = true;
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
    public static ValidateOrder(expression: Expression, optional: ReturnType[], ...types: ReturnType[]): void {
        if (optional === undefined) {
            optional = [];
        }
        if (expression.Children.length < types.length || expression.Children.length > types.length + optional.length) {
            throw new Error(optional.length === 0 ?
                `${expression} should have ${types.length} children.`
                : `${expression} should have between ${types.length} and ${types.length + optional.length} children.`);
        }

        for (let i: number = 0; i < types.length; i++) {
            const child: Expression = expression.Children[i];
            const type: ReturnType = types[i];
            if (type !== ReturnType.Object && child.ReturnType !== ReturnType.Object && child.ReturnType !== type) {
                throw new Error(`${child} in ${expression} is not a ${type}.`);
            }
        }

        for (let i: number = 0; i < optional.length; i++) {
            const ic: number = i + types.length;
            if (ic >= expression.Children.length) {
                break;
            }
            const child: Expression = expression.Children[ic];
            const type: ReturnType = optional[i];
            if (type !== ReturnType.Object && child.ReturnType !== ReturnType.Object && child.ReturnType !== type) {
                throw new Error(`${child} in ${expression} is not a ${type}.`);
            }
        }
    }

    /**
     * Validate at least 1 argument of any type.
     * @param expression Expression to validate.
     */
    public static ValidateAtLeastOne(expression: Expression): void {

        BuiltInFunctions.ValidateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER);
    }

    /**
     * Validate 1 or more numeric arguments.
     * @param expression Expression to validate.
     */
    public static ValidateNumber(expression: Expression): void {

        BuiltInFunctions.ValidateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.Number);
    }

    /**
     * Validate 1 or more string arguments.
     * @param expression Expression to validate.
     */
    public static ValidateString(expression: Expression): void {
        BuiltInFunctions.ValidateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.String);
    }

    /**
     * Validate there are two children.
     * @param expression Expression to validate.
     */
    public static ValidateBinary(expression: Expression): void {
        BuiltInFunctions.ValidateArityAndAnyType(expression, 2, 2);
    }

    /**
     * Validate 2 numeric arguments.
     * @param expression Expression to validate.
     */
    public static ValidateBinaryNumber(expression: Expression): void {
        BuiltInFunctions.ValidateArityAndAnyType(expression, 2, 2, ReturnType.Number);
    }

    /**
     * Validate 2 or more than 2 numeric arguments.
     * @param expression Expression to validate.
     */
    public static ValidateTwoOrMoreThanTwoNumbers(expression: Expression): void {
        BuiltInFunctions.ValidateArityAndAnyType(expression, 2, Number.MAX_VALUE, ReturnType.Number);
    }

    /**
     * Validate there are 2 numeric or string arguments.
     * @param expression Expression to validate.
     */
    public static ValidateBinaryNumberOrString(expression: Expression): void {
        BuiltInFunctions.ValidateArityAndAnyType(expression, 2, 2, ReturnType.Number, ReturnType.String);
    }

    /**
     * Validate there is a single argument.
     * @param expression Expression to validate.
     */
    public static ValidateUnary(expression: Expression): void {
        BuiltInFunctions.ValidateArityAndAnyType(expression, 1, 1);
    }

    /**
     * Validate there is a single string argument.
     * @param expression Expression to validate.
     */
    public static ValidateUnaryString(expression: Expression): void {
        BuiltInFunctions.ValidateArityAndAnyType(expression, 1, 1, ReturnType.String);
    }

    /**
     * Validate there is a single boolean argument.
     * @param expression Expression to validate.
     */
    public static ValidateUnaryBoolean(expression: Expression): void {
        BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.Boolean);
    }

    /**
     * Verify value is numeric.
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static VerifyNumber(value: any, expression: Expression, _: number): string {
        let error: string;
        if (typeof value !== 'number' || Number.isNaN(value)) {
            error = `${expression} is not a number.`;
        }

        return error;
    }

    /**
     * Verify value is numeric list.
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static VerifyNumericList(value: any, expression: Expression, _: number): string {
        let error: string;
        if (!(value instanceof Array)) {
            error = `${expression} is not a list.`;
        } else {
            for (const elt of value) {
                if (typeof elt !== 'number' || Number.isNaN(elt)) {
                    error = `${elt} is not a number in ${expression}.`;
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
    public static VerifyContainer(value: any, expression: Expression, _: number): string {
        let error: string;
        if (!(typeof value === 'string') && !(value instanceof Array) && !(value instanceof Map)) {
            error = `${expression} must be a string or list or map.`;
        }

        return error;
    }

    /**
     * Verify value is an integer.
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static VerifyInteger(value: any, expression: Expression, _: number): string {
        let error: string;
        if (!Number.isInteger(value)) {
            error = `${expression} is not a integer.`;
        }

        return error;
    }

    /**
     * Verify value is an list.
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static VerifyList(value: any, expression: Expression): string {
        let error: string;
        if (!(value instanceof Array)) {
            error = `${expression} is not a list or array.`;
        }

        return error;
    }

    /**
     * Verify value is a string.
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static VerifyString(value: any, expression: Expression, _: number): string {
        let error: string;
        if (typeof value !== 'string') {
            error = `${expression} is not a string.`;
        }

        return error;
    }

    /**
     * Verify value is a number or string.
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static VerifyNumberOrString(value: any, expression: Expression, _: number): string {
        let error: string;
        if (value === undefined || !(typeof value === 'number' && !Number.isNaN(value)) && typeof value !== 'string') {
            error = `${expression} is not string or number.`;
        }

        return error;
    }

    /**
     * Verify value is boolean.
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static VerifyBoolean(value: any, expression: Expression, _: number): string {
        let error: string;
        if (typeof value !== 'boolean') {
            error = `${expression} is not a boolean.`;
        }

        return error;
    }

    /**
     * Verify a timestamp string is valid timestamp format.
     * @param value timestamp string to check.
     * @returns Error or undefined if invalid.
     */
    public static VerifyTimestamp(value: any): string {
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
     * @param value timestamp string to check.
     * @returns Error or undefined if invalid.
     */
    public static VerifyISOTimestamp(value: any): string {
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
     * Evaluate expression children and return them.
     * @param expression Expression with children.
     * @param state Global state.
     * @param verify Optional function to verify each child's result.
     * @returns List of child values or error message.
     */
    public static EvaluateChildren(expression: Expression, state: any, verify?: VerifyExpression)
        : { args: ReadonlyArray<any>; error: string } {
        const args: any[] = [];
        let value: any;
        let error: string;
        let pos: number = 0;
        for (const child of expression.Children) {
            ({ value, error } = child.tryEvaluate(state));
            if (error !== undefined) {
                break;
            }
            if (verify !== undefined) {
                error = verify(value, child, pos);
            }
            if (error !== undefined) {
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
    public static Apply(func: (arg0: ReadonlyArray<any>) => any, verify?: VerifyExpression)
        : EvaluateExpressionDelegate {
        return (expression: Expression, state: any): { value: any; error: string } => {
            let value: any;
            let error: string;
            let args: ReadonlyArray<any>;
            ({ args, error } = BuiltInFunctions.EvaluateChildren(expression, state, verify));
            if (error === undefined) {
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
    public static ApplyWithError(func: (arg0: ReadonlyArray<any>) => any, verify?: VerifyExpression)
        : EvaluateExpressionDelegate {
        return (expression: Expression, state: any): { value: any; error: string } => {
            let value: any;
            let error: string;
            let args: ReadonlyArray<any>;
            ({ args, error } = BuiltInFunctions.EvaluateChildren(expression, state, verify));
            if (error === undefined) {
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
    public static ApplySequence(func: (arg0: ReadonlyArray<any>) => any, verify?: VerifyExpression)
        : EvaluateExpressionDelegate {
        return BuiltInFunctions.Apply(
            (args: ReadonlyArray<any>): any => {
                const binaryArgs: any[] = [undefined, undefined];
                let soFar: any = args[0];
                // tslint:disable-next-line: prefer-for-of
                for (let i: number = 1; i < args.length; i++) {
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
     * Numeric operators that can have 1 or more args.
     * @param type Expression type.
     * @param func Function to apply.
     */
    public static Numeric(type: string, func: (arg0: ReadonlyArray<any>) => any): ExpressionEvaluator {
        return new ExpressionEvaluator(type, BuiltInFunctions.ApplySequence(func, BuiltInFunctions.VerifyNumber),
            ReturnType.Number, BuiltInFunctions.ValidateNumber);
    }

    /**
     * Numeric operators that can have 2 or more args.
     * @param type Expression type.
     * @param func Function to apply.
     */
    public static MultivariateNumeric(type: string, func: (arg0: ReadonlyArray<any>) => any, verify?: VerifyExpression): ExpressionEvaluator {
        return new ExpressionEvaluator(type, BuiltInFunctions.ApplySequence(func, verify !== undefined ? verify : BuiltInFunctions.VerifyNumber),
            ReturnType.Number, BuiltInFunctions.ValidateTwoOrMoreThanTwoNumbers);
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
    public static Comparison(type: string, func: (arg0: ReadonlyArray<any>) => boolean, validator: ValidateExpressionDelegate, verify?: VerifyExpression)
        : ExpressionEvaluator {
        return new ExpressionEvaluator(
            type,
            (expression: Expression, state: any): { value: any; error: string } => {
                let result: boolean = false;
                let error: string;
                let args: ReadonlyArray<any>;
                ({ args, error } = BuiltInFunctions.EvaluateChildren(expression, state, verify));
                if (error === undefined) {
                    const isNumber: boolean = args !== undefined && args.length > 0 && typeof args[0] === 'number';
                    for (const arg of args) {
                        if (arg !== undefined && (typeof arg === 'number') !== isNumber) {
                            error = `Arguments must either all be numbers or strings in ${expression}`;
                            break;
                        }
                    }

                    if (error === undefined) {
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
    public static StringTransform(type: string, func: (arg0: ReadonlyArray<any>) => any): ExpressionEvaluator {
        return new ExpressionEvaluator(type, BuiltInFunctions.Apply(func, BuiltInFunctions.VerifyString),
            ReturnType.String, BuiltInFunctions.ValidateUnaryString);
    }

    /**
     * Transform a datetime into another datetime.
     * @param type Expression type.
     * @param func Transformer.
     * @returns Delegate for evaluating expression.
     */
    public static TimeTransform(type: string, func: (timestamp: moment.Moment, numOfTransformation: any) => any): ExpressionEvaluator {
        return new ExpressionEvaluator(
            type,
            (expression: Expression, state: any): { value: any; error: string } => {
                let result: any;
                let error: string;
                let value: any;
                let args: ReadonlyArray<any>;
                ({ args, error } = BuiltInFunctions.EvaluateChildren(expression, state));
                if (error === undefined) {
                    if (typeof args[0] === 'string' && typeof args[1] === 'number') {
                        ({ value, error } = BuiltInFunctions.ParseTimestamp(args[0]));
                        if (error === undefined) {
                            if (args.length === 3 && typeof args[2] === 'string') {
                                result = func(value, args[1]).format(BuiltInFunctions.TimestampFormatter(args[2]));
                            } else {
                                result = func(value, args[1]).toISOString();
                            }
                        }
                    } else {
                        error = `${expression} could not be evaluated`;
                    }
                }

                return { value: result, error };
            },
            ReturnType.String,
            (expr: Expression): void => BuiltInFunctions.ValidateArityAndAnyType(expr, 2, 3, ReturnType.String, ReturnType.Number));
    }

    public static ParseTimestamp(timeStamp: string, transform?: (arg0: moment.Moment) => any): { value: any; error: string } {
        let value: any;
        const error: string = this.VerifyISOTimestamp(timeStamp);
        if (error === undefined) {
            const parsed: moment.Moment = moment(timeStamp).utc();
            value = transform !== undefined ? transform(parsed) : parsed;
        }

        return { value, error };
    }

    /**
     * Lookup a built-in function information by type.
     * @param type Type to look up.
     */
    public static Lookup(type: string): ExpressionEvaluator {
        const evaluator: ExpressionEvaluator = BuiltInFunctions._functions.get(type);
        if (evaluator === undefined) {
            throw new Error(`${type} does not have an evaluator, it's not a built-in function or a customized function`);
        }

        return evaluator;
    }

    public static TimestampFormatter(formatter: string): string {
        return formatter.replace(/dd/g, 'DD').replace(/yyyy/g, 'YYYY').replace(/d/g, 'D').replace(/y/g, 'Y');
    }

    public static TimeUnitTransformer(duration: number, cSharpStr: string): { duration: number; tsStr: string } {
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

    private static AddOrdinal(num: number): string {
        let hasResult: boolean = false;
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

    private static newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: any) => {
            const r: number = Math.random() * 16 | 0;
            const v: number = c === 'x' ? r : (r & 0x3 | 0x8);

            return v.toString(16);
        });
    }

    private static ValidateAccessor(expression: Expression): void {
        const children: Expression[] = expression.Children;
        if (children.length === 0
            || !(children[0] instanceof Constant)
            || (<Constant>children[0]).ReturnType !== ReturnType.String) {
            throw new Error(`${expression} must have a string as first argument.`);
        }

        if (children.length > 2) {
            throw new Error(`${expression} has more than 2 children.`);
        }
        if (children.length === 2 && children[1].ReturnType !== ReturnType.Object) {
            throw new Error(`${expression} must have an object as its second argument.`);
        }
    }

    private static Accessor(expression: Expression, state: any): { value: any; error: string } {
        let value: any;
        let error: string;
        let instance: any;
        const children: Expression[] = expression.Children;
        if (children.length === 2) {
            ({ value: instance, error } = children[1].tryEvaluate(state));
        } else {
            instance = state;
        }

        if (error === undefined && children[0] instanceof Constant && (<Constant>children[0]).ReturnType === ReturnType.String) {
            ({ value, error } = Extensions.AccessProperty(instance, (<Constant>children[0]).Value.toString()));
        }

        return { value, error };
    }

    private static GetProperty(expression: Expression, state: any): { value: any; error: string } {
        let value: any;
        let error: string;
        let instance: any;
        let property: any;

        const children: Expression[] = expression.Children;
        ({ value: instance, error } = children[0].tryEvaluate(state));
        if (error === undefined) {
            ({ value: property, error } = children[1].tryEvaluate(state));

            if (error === undefined) {
                ({ value, error } = Extensions.AccessProperty(instance, property.toString()));
            }
        }

        return { value, error };
    }

    private static Coalesce(objetcList: object[]): any {
        for (const obj of objetcList) {
            if (obj !== undefined) {
                return obj;
            }
        }

        return undefined;
    }

    private static XPath(xmlStr: string, xpath: string): {value: any; error: string} {
        let result: any;
        let error: string;
        let xmlDoc: any;
        const parser: any = new xmldom.DOMParser();
        let xPathResult: any;
        try {
            xmlDoc = parser.parseFromString(xmlStr);
        } catch (e) {
            error = `${xmlStr} is not valid xml`;
        }

        if (error === undefined) {
            try {
                xPathResult = xpathEval.select(xpath, xmlDoc);
            } catch (e) {
                error = `${xpath} is not an valid expression`;
            }
        }

        if (error === undefined) {
            if (typeof xPathResult === 'string' || typeof xPathResult === 'number' || typeof xPathResult === 'boolean') {
                result = xPathResult;
            } else if (xPathResult.length > 0) {
                result = xPathResult.toString().split(',');
            }
        }

        return {value: result, error};
        }

    private static JPath(jsonEntity: object | string, path: string): {value: any; error: string} {
        let result: any;
        let error: string;
        let evaled: any;
        let json: object;
        if (typeof jsonEntity === 'string') {
            try {
                json =JSON.parse(jsonEntity)
            } catch (e) {
                error = `${jsonEntity} is not a valid json string`;
            }
        } else if (typeof jsonEntity === 'object') {
            json = jsonEntity;
        } else {
            error = "the first parameter should be either an object or a string";
        }

        if (error === undefined) {
            try {
                evaled = jsPath.apply(path, json);
            } catch (e) {
                error = `${path} is not a valid path + ${e}`;
            }
        }

        result = evaled;    
        return {value: result, error};
    }

    private static ExtractElement(expression: Expression, state: any): { value: any; error: string } {
        let value: any;
        let error: string;
        const instance: Expression = expression.Children[0];
        const index: Expression = expression.Children[1];
        let inst: any;
        ({ value: inst, error } = instance.tryEvaluate(state));
        if (error === undefined) {
            let idxValue: any;
            ({ value: idxValue, error } = index.tryEvaluate(state));
            if (error === undefined) {
                if (Number.isInteger(idxValue)) {
                    ({ value, error } = Extensions.AccessIndex(inst, Number(idxValue)));
                } else if (typeof idxValue === 'string') {
                    ({ value, error } = Extensions.AccessProperty(inst, idxValue.toString()));
                } else {
                    error = `Could not coerce ${index} to an int or string.`;
                }

                return { value, error };
            }
        }
    }

    private static CanBeModified(value: any, property: string, expected?: number): boolean {
        let modifiable: boolean = false;
        if (expected !== undefined) {
            // Modifiable list
            modifiable = value instanceof Array;
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

    private static TrySetPathToValue(path: Expression, value: any, state: any, expected?: number): { instance: any; error: string } {
        let result: any;
        let error: string;
        let instance: any;
        let index: any;
        const children: Expression[] = path.Children;
        if (path.Type === ExpressionType.Accessor || path.Type === ExpressionType.Element) {
            ({ value: index, error } = children[path.Type === ExpressionType.Accessor ? 0 : 1].tryEvaluate(state));
            if (error === undefined) {
                const iindex: number = index;
                if (children.length === 2) {
                    ({ instance, error } = this.TrySetPathToValue(children[path.Type === ExpressionType.Accessor ? 1 : 0], undefined, state, iindex));
                } else {
                    instance = state;
                }

                if (error === undefined) {
                    if (typeof index === 'string') {
                        const propName: string = index;
                        if (value !== undefined) {
                            result = Extensions.SetProperty(instance, propName, value);
                        } else {
                            ({ value: result, error } = Extensions.AccessProperty(instance, propName));
                            if (error !== undefined || result === undefined || !this.CanBeModified(result, propName, expected)) {
                                // Create new value for parents to use
                                if (expected !== undefined) {
                                    result = Extensions.SetProperty(instance, propName, [expected + 1]);
                                } else {
                                    result = Extensions.SetProperty(instance, propName, new Map<string, any>());
                                }
                            }
                        }
                    } else if (iindex !== undefined) {
                        // Child instance should be a list already because we passed down the iindex.
                        if (instance instanceof Array) {
                            const list: any[] = instance;
                            if (list.length <= iindex) {
                                while (list.length < iindex) {
                                    // Extend list.
                                    list.push(undefined);
                                }
                            }

                            // Assign value or expected list size or object
                            result = value !== undefined ? value : expected !== undefined ? [expected + 1] : new Map<string, any>();
                            list[iindex] = result;
                        } else {
                            error = `${children[0]} is not a list.`;
                        }
                    } else {
                        error = `${children[0]} is not a valid path.`;
                    }
                }
            }
        } else {
            error = `${path} is not a path that can be set to a value.`;
        }

        return { instance: result, error };
    }

    private static SetPathToValue(expression: Expression, state: any): { value: any; error: string } {
        let value: any;
        let error: string;
        const path: Expression = expression.Children[0];
        const valueExpr: Expression = expression.Children[1];
        ({ value, error } = valueExpr.tryEvaluate(state));
        if (error === undefined) {
            let instance: any;
            ({ instance, error } = BuiltInFunctions.TrySetPathToValue(path, value, state));
            if (error !== undefined) {
                value = undefined;
            }
        }

        return {value, error};
    }

    private static Foreach(expression: Expression, state: any): { value: any; error: string } {
        let result: any[];
        let error: string;
        let collection: any;

        ({ value: collection, error } = expression.Children[0].tryEvaluate(state));

        if (error === undefined) {
            // 2nd parameter has been rewrite to $local.item
            const iteratorName: string = <string>((<Constant>(expression.Children[1].Children[0])).Value);
            if (!(collection instanceof Array)) {
                error = `${expression.Children[0]} is not a collection to run foreach`;
            } else {
                result = [];
                for (const item of collection) {
                    const local: Map<string, any> = new Map<string, any>([
                        [iteratorName, item]
                    ]);

                    const newScope: Map<string, any> = new Map<string, any>([
                        ['$global', state],
                        ['$local', local]
                    ]);

                    const { value: r, error: e } = expression.Children[2].tryEvaluate(newScope);
                    if (e !== undefined) {
                        return { value: undefined, error: e };
                    }
                    result.push(r);
                }
            }
        }

        return { value: result, error };
    }

    private static Where(expression: Expression, state: any): { value: any; error: string } {
        let result: any[];
        let error: string;
        let collection: any;

        ({ value: collection, error } = expression.Children[0].tryEvaluate(state));

        if (error === undefined) {
            const iteratorName: string = <string>((<Constant>(expression.Children[1].Children[0])).Value);
            if (!(collection instanceof Array)) {
                error = `${expression.Children[0]} is not a collection to run where`;
            } else {
                result = [];
                for (const item of collection) {
                    const local: Map<string, any> = new Map<string, any>([
                        [iteratorName, item]
                    ]);

                    const newScope: Map<string, any> = new Map<string, any>([
                        ['$global', state],
                        ['$local', local]
                    ]);

                    const { value: r, error: e } = expression.Children[2].tryEvaluate(newScope);
                    if (e !== undefined) {
                        return { value: undefined, error: e };
                    }

                    if ((Boolean(r))) {
                        result.push(local.get(iteratorName));
                    }
                }
            }
        }

        return { value: result, error };
    }

    private static ValidateWhere(expression: Expression): void {
        BuiltInFunctions.ValidateForeach(expression);
    }

    private static ValidateForeach(expression: Expression): void {
        if (expression.Children.length !== 3) {
            throw new Error(`foreach expect 3 parameters, found ${expression.Children.length}`);
        }

        const second: Expression = expression.Children[1];
        if (!(second.Type === ExpressionType.Accessor && second.Children.length === 1)) {
            throw new Error(`Second parameter of foreach is not an identifier : ${second}`);
        }

        const iteratorName: string = second.toString();

        // rewrite the 2nd, 3rd paramater
        expression.Children[1] = BuiltInFunctions.RewriteAccessor(expression.Children[1], iteratorName);
        expression.Children[2] = BuiltInFunctions.RewriteAccessor(expression.Children[2], iteratorName);
    }

    private static ValidateIsMatch(expression: Expression): void {
        BuiltInFunctions.ValidateArityAndAnyType(expression, 2, 2, ReturnType.String);

        const second: Expression = expression.Children[1];
        if (second.ReturnType === ReturnType.String && second.Type === ExpressionType.Constant) {
            CommonRegex.CreateRegex((<Constant>second).Value + '');
        }
    }

    private static RewriteAccessor(expression: Expression, localVarName: string): Expression {
        if (expression.Type === ExpressionType.Accessor) {
            if (expression.Children.length === 2) {
                expression.Children[1] = BuiltInFunctions.RewriteAccessor(expression.Children[1], localVarName);
            } else {
                const str: string = expression.toString();
                let prefix: string = '$global';
                if (str === localVarName || str.startsWith(localVarName.concat('.'))) {
                    prefix = '$local';
                }

                expression.Children = [
                    expression.Children[0],
                    Expression.MakeExpression(ExpressionType.Accessor, undefined, new Constant(prefix))
                ];
            }

            return expression;
        } else {
            // rewite children if have any
            for (let idx: number = 0; idx < expression.Children.length; idx++) {
                expression.Children[idx] = BuiltInFunctions.RewriteAccessor(expression.Children[idx], localVarName);
            }

            return expression;
        }

    }

    private static IsEmpty(instance: any): boolean {
        let result: boolean;
        if (instance === undefined) {
            result = true;
        } else if (typeof instance === 'string') {
            result = instance === '';
        } else if (instance instanceof Array) {
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
    private static IsLogicTrue(instance: any): boolean {
        let result: boolean = true;

        if (typeof instance === 'boolean') {
            result = instance;
        } else if (instance === undefined) {
            result = false;
        }

        return result;
    }

    private static And(expression: Expression, state: any): { value: any; error: string } {
        let result: boolean = false;
        let error: string;
        for (const child of expression.Children) {
            ({ value: result, error } = child.tryEvaluate(state));
            if (error === undefined) {
                if (this.IsLogicTrue(result)) {
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

    private static Or(expression: Expression, state: any): { value: any; error: string } {
        let result: boolean = false;
        let error: string;
        for (const child of expression.Children) {
            ({ value: result, error } = child.tryEvaluate(state));
            if (error === undefined) {
                if (this.IsLogicTrue(result)) {
                    result = true;
                    break;
                }
            } else {
                error = undefined;
            }
        }

        return { value: result, error };
    }

    private static Not(expression: Expression, state: any): { value: any; error: string } {
        let result: boolean = false;
        let error: string;
        ({ value: result, error } = expression.Children[0].tryEvaluate(state));
        if (error === undefined) {
            result = !this.IsLogicTrue(result);
        } else {
            error = undefined;
            result = true;
        }

        return { value: result, error };
    }

    private static If(expression: Expression, state: any): { value: any; error: string } {
        let result: any;
        let error: string;
        ({ value: result, error } = expression.Children[0].tryEvaluate(state));
        if (error === undefined && this.IsLogicTrue(result)) {
            ({ value: result, error } = expression.Children[1].tryEvaluate(state));
        } else {
            ({ value: result, error } = expression.Children[2].tryEvaluate(state));
        }

        return { value: result, error };
    }

    private static Substring(expression: Expression, state: any): { value: any; error: string } {
        let result: any;
        let error: any;
        let str: string;
        ({ value: str, error } = expression.Children[0].tryEvaluate(state));

        if (error === undefined) {
            if (typeof str === 'string') {
                let start: number;

                const startExpr: Expression = expression.Children[1];
                ({ value: start, error } = startExpr.tryEvaluate(state));
                if (error === undefined && !Number.isInteger(start)) {
                    error = `${startExpr} is not an integer.`;
                } else if (start < 0 || start >= str.length) {
                    error = `${startExpr}=${start} which is out of range for ${str}`;
                }
                if (error === undefined) {
                    let length: number;
                    if (expression.Children.length === 2) {
                        // Without length, compute to end
                        length = str.length - start;
                    } else {
                        const lengthExpr: Expression = expression.Children[2];
                        ({ value: length, error } = lengthExpr.tryEvaluate(state));
                        if (error === undefined && !Number.isInteger(length)) {
                            error = `${lengthExpr} is not an integer`;
                        } else if (length < 0 || Number(start) + Number(length) > str.length) {
                            error = `${lengthExpr}=${length} which is out of range for ${str}`;
                        }
                    }
                    if (error === undefined) {
                        result = str.substr(start, length);
                    }
                }
            } else {
                error = `${expression.Children[0]} is not a string.`;
            }
        }

        return { value: result, error };
    }

    private static Skip(expression: Expression, state: any): { value: any; error: string } {
        let result: any;
        let error: any;
        let arr: any;
        ({ value: arr, error } = expression.Children[0].tryEvaluate(state));

        if (error === undefined) {
            if (arr instanceof Array) {
                let start: number;

                const startExpr: Expression = expression.Children[1];
                ({ value: start, error } = startExpr.tryEvaluate(state));
                if (error === undefined && !Number.isInteger(start)) {
                    error = `${startExpr} is not an integer.`;
                } else if (start < 0 || start >= arr.length) {
                    error = `${startExpr}=${start} which is out of range for ${arr}`;
                }
                if (error === undefined) {
                   result = arr.slice(start);
                }
            } else {
                error = `${expression.Children[0]} is not array.`;
            }
        }

        return { value: result, error };
    }

    private static Take(expression: Expression, state: any): { value: any; error: string } {
        let result: any;
        let error: any;
        let arr: any;
        ({ value: arr, error } = expression.Children[0].tryEvaluate(state));

        if (error === undefined) {
            if (arr instanceof Array || typeof arr === 'string') {
                let start: number;

                const startExpr: Expression = expression.Children[1];
                ({ value: start, error } = startExpr.tryEvaluate(state));
                if (error === undefined && !Number.isInteger(start)) {
                    error = `${startExpr} is not an integer.`;
                } else if (start < 0 || start >= arr.length) {
                    error = `${startExpr}=${start} which is out of range for ${arr}`;
                }
                if (error === undefined) {
                    result = arr.slice(0, start);
                }
            } else {
                error = `${expression.Children[0]} is not array or string.`;
            }
        }

        return { value: result, error };
    }

    private static SubArray(expression: Expression, state: any): { value: any; error: string } {
        let result: any;
        let error: any;
        let arr: any;
        ({ value: arr, error } = expression.Children[0].tryEvaluate(state));

        if (error === undefined) {
            if (arr instanceof Array) {
                let start: number;

                const startExpr: Expression = expression.Children[1];
                ({ value: start, error } = startExpr.tryEvaluate(state));
                if (error === undefined && !Number.isInteger(start)) {
                    error = `${startExpr} is not an integer.`;
                } else if (start < 0 || start >= arr.length) {
                    error = `${startExpr}=${start} which is out of range for ${arr}`;
                }
                if (error === undefined) {
                    let end: number;
                    if (expression.Children.length === 2) {
                        end = arr.length;
                    } else {
                        const endExpr: Expression = expression.Children[2];
                        ({ value: end, error } = endExpr.tryEvaluate(state));
                        if (error === undefined && !Number.isInteger(end)) {
                            error = `${endExpr} is not an integer`;
                        } else if (end < 0 || end > arr.length) {
                            error = `${endExpr}=${end} which is out of range for ${arr}`;
                        }
                    }
                    if (error === undefined) {
                        result = arr.slice(start, end);
                    }
                }
            } else {
                error = `${expression.Children[0]} is not array.`;
            }
        }

        return { value: result, error };
    }

    private static ToBinary(stringToConvert: string): string {
        let result: string = '';
        for (const element of stringToConvert) {
            const binaryElement: string = element.charCodeAt(0).toString(2);
            result += new Array(9 - binaryElement.length).join('0').concat(binaryElement);
        }

        return result;
    }

    private static ToXml(contentToConvert: any): { value: any; error: string } {
        let result: string;
        let error: string;
        try {
            const jsonObj: any = typeof contentToConvert === 'string' ? JSON.parse(contentToConvert) : contentToConvert;
            result = new Builder().buildObject(jsonObj);
        } catch (e) {
            error = 'Invalid json';
        }

        return { value: result, error };
    }

    // DateTime Functions
    private static AddToTime(timeStamp: string, interval: number, timeUnit: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: any;
        ({value: parsed, error} = BuiltInFunctions.ParseTimestamp(timeStamp));
        if (error === undefined) {
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
                    error = `${timeUnit} is not valid time unit`;
                    break;
                }
            }

            if (error === undefined) {
                addedTime = parsed.add(interval, timeUnitMark);
                ({value: result, error} = this.ReturnFormattedTimeStampStr(addedTime, format));
            }
    }

        return {value: result, error};
    }

    private static ReturnFormattedTimeStampStr(timedata: moment.Moment, format: string): {value: any; error: string } {
        let result: string;
        let error: string;
        try {
            result = timedata.format(format);
        } catch (e) {
            error = `${format} is not a valid timestamp format`;
        }

        return {value: result, error};
    }

    private static ConvertFromUTC(timeStamp: string, destinationTimeZone: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        error = this.VerifyISOTimestamp(timeStamp);
        const timeZone: string = TimeZoneConverter.WindowsToIana(destinationTimeZone);
        if (!TimeZoneConverter.VerifyTimeZoneStr(timeZone)) {
            error = `${destinationTimeZone} is not a valid timezone`;
        }

        if (error === undefined) {
            try {
                result = timezone.tz(timeStamp, timeZone).format(format);
            } catch (e) {
                error = `${format} is not a valid timestamp format`;
            }
        }

        return {value: result, error};
    }

    private static VerifyTimeStamp(timeStamp: string): string {
        let parsed: any;
        let error: string;
        parsed = moment(timeStamp);
        if (parsed.toString() === 'Invalid date') {
            error = `${timeStamp} is a invalid datetime`;
        }

        return error;
    }

    private static ConvertToUTC(timeStamp: string, sourceTimezone: string, format?: string):  {value: any; error: string} {
        let result: string;
        let error: string;
        let formattedSourceTime: string;
        const timeZone: string = TimeZoneConverter.WindowsToIana(sourceTimezone);
        if (!TimeZoneConverter.VerifyTimeZoneStr(timeZone)) {
            error = `${sourceTimezone} is not a valid timezone`;
        }

        if (error === undefined) {
            error = this.VerifyTimeStamp(timeStamp);
            if (error === undefined) {
                try {
                    const sourceTime: moment.Moment = timezone.tz(timeStamp, timeZone);
                    formattedSourceTime = sourceTime.format();
                    } catch (e) {
                    error = `${timeStamp} with ${timeZone} is not a valid timestamp with specified timeZone:`;
                }

                if (error === undefined) {
                    try {
                        result = timezone.tz(formattedSourceTime, 'Etc/UTC').format(format);
                    } catch (e) {
                        error = `${format} is not a valid timestamp format`;
                    }
                }
            }
        }

        return {value: result, error};
    }

    private static Ticks(timeStamp: string): {value: any; error: string} {
        let parsed: any;
        let result: number;
        let error: string;
        ({value: parsed, error} = BuiltInFunctions.ParseTimestamp(timeStamp));
        if (error === undefined) {
            const unixMilliSec: number = parseInt(parsed.format('x'), 10);
            result = this.UnixMilliSecondToTicksConstant + unixMilliSec * 10000;
        }

        return {value: result, error};
    }

    private static StartOfDay(timeStamp: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: moment.Moment;
        ({value: parsed, error} = BuiltInFunctions.ParseTimestamp(timeStamp));
        if (error === undefined) {
            const startOfDay: moment.Moment = parsed.hours(0).minutes(0).second(0).millisecond(0);
            ({value: result, error} =  BuiltInFunctions.ReturnFormattedTimeStampStr(startOfDay, format));
        }

        return {value: result, error};
    }

    private static StartOfHour(timeStamp: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: moment.Moment;
        ({value: parsed, error} = BuiltInFunctions.ParseTimestamp(timeStamp));
        if (error === undefined) {
            const startofHour: moment.Moment = parsed.minutes(0).second(0).millisecond(0);
            ({value: result, error} =  BuiltInFunctions.ReturnFormattedTimeStampStr(startofHour, format));
        }

        return {value: result, error};
    }

    private static StartOfMonth(timeStamp: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: moment.Moment;
        ({value: parsed, error} = BuiltInFunctions.ParseTimestamp(timeStamp));
        if (error === undefined) {
            const startofMonth: moment.Moment = parsed.date(1).hours(0).minutes(0).second(0).millisecond(0);
            ({value: result, error} =  BuiltInFunctions.ReturnFormattedTimeStampStr(startofMonth, format));
        }

        return {value: result, error};
    }

    // Uri Parsing Function
    private static ParseUri(uri: string): {value: any; error: string} {
        let result: URL;
        let error: string;
        try {
            result = new URL(uri);
        } catch (e) {
            error = `Invalid URI: ${uri}`;
        }

        return {value: result, error};
    }

    private static UriHost(uri: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: URL;
        ({value: parsed, error} = this.ParseUri(uri));
        if (error === undefined) {
            try {
                result = parsed.hostname;
            } catch (e) {
                error = 'invalid operation, input uri should be an absolute URI';
            }
        }

        return {value: result, error};
    }

    private static UriPath(uri: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: URL;
        ({value: parsed, error} = this.ParseUri(uri));
        if (error === undefined) {
            try {
                const uriObj: URL = new URL(uri);
                result = uriObj.pathname;
            } catch (e) {
                error = 'invalid operation, input uri should be an absolute URI';
            }
        }

        return {value: result, error};
    }

    private static UriPathAndQuery(uri: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: URL;
        ({value: parsed, error} = this.ParseUri(uri));
        if (error === undefined) {
            try {
                result = parsed.pathname + parsed.search;
            } catch (e) {
                error = 'invalid operation, input uri should be an absolute URI';
            }
        }

        return {value: result, error};
    }

    private static UriPort(uri: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: URL;
        ({value: parsed, error} = this.ParseUri(uri));
        if (error === undefined) {
            try {
                result = parsed.port;
            } catch (e) {
                error = 'invalid operation, input uri should be an absolute URI';
            }
        }

        return {value: result, error};
    }

    private static UriQuery(uri: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: URL;
        ({value: parsed, error} = this.ParseUri(uri));
        if (error === undefined) {
            try {
                result = parsed.search;
            } catch (e) {
                error = 'invalid operation, input uri should be an absolute URI';
            }
        }

        return {value: result, error};
    }

    private static UriScheme(uri: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: URL;
        ({value: parsed, error} = this.ParseUri(uri));
        if (error === undefined) {
            try {
                result = parsed.protocol.replace(':', '');
            } catch (e) {
                error = 'invalid operation, input uri should be an absolute URI';
            }
        }

        return {value: result, error};
    }

    private static Callstack(expression: Expression, state: any): { value: any; error: string } {
        let result: any =  state;
        let error: string;

        // get collection
        ({ value: result, error} = Extensions.AccessProperty(state, 'callstack'));
        if (result !== undefined) {
            const items: any[] = result as any[];
            let property: any;
            ({value: property, error} = expression.Children[0].tryEvaluate(state));
            if (property !== undefined && error === undefined) {
                for (const item of items) {
                    // get property off of item
                    ({ value: result, error } = Extensions.AccessProperty(item, property.toString()));

                    // if not null
                    if (error === undefined && result !== undefined) {
                        // return it
                        return { value: result, error };
                    }
                }
            }
        }

        return { value: undefined, error };
    }

    // tslint:disable-next-line: max-func-body-length
    private static BuildFunctionLookup(): Map<string, ExpressionEvaluator> {
        // tslint:disable-next-line: no-unnecessary-local-variable
        const functions: ExpressionEvaluator[] = [
            //Math
            new ExpressionEvaluator(ExpressionType.Element, BuiltInFunctions.ExtractElement, ReturnType.Object, this.ValidateBinary),
            BuiltInFunctions.MultivariateNumeric(ExpressionType.Add, (args: ReadonlyArray<any>) => Number(args[0]) + Number(args[1])),
            BuiltInFunctions.MultivariateNumeric(ExpressionType.Subtract, (args: ReadonlyArray<any>) => Number(args[0]) - Number(args[1])),
            BuiltInFunctions.MultivariateNumeric(ExpressionType.Multiply, (args: ReadonlyArray<any>) => Number(args[0]) * Number(args[1])),
            BuiltInFunctions.MultivariateNumeric(
                ExpressionType.Divide,
                (args: ReadonlyArray<any>) => Math.floor(Number(args[0]) / Number(args[1])),
                (val: any, expression: Expression, pos: number) => {
                    let error: string = this.VerifyNumber(val, expression, pos);
                    if (error === undefined && (pos > 0 && Number(val) === 0)) {
                        error = `Cannot divide by 0 from ${expression}`;
                    }

                    return error;
                }),
            BuiltInFunctions.Numeric(ExpressionType.Min, (args: ReadonlyArray<any>) => Math.min(args[0], args[1])),
            BuiltInFunctions.Numeric(ExpressionType.Max, (args: ReadonlyArray<any>) => Math.max(args[0], args[1])),
            BuiltInFunctions.MultivariateNumeric(ExpressionType.Power, (args: ReadonlyArray<any>) => Math.pow(args[0], args[1])),
            new ExpressionEvaluator(
                ExpressionType.Mod,
                BuiltInFunctions.ApplyWithError(
                    (args: ReadonlyArray<any>) => {
                        let error: string;
                        let value: any;
                        if (Number(args[1]) === 0) {
                            error = (`Cannot mod by 0.`);
                        } else {
                            value = args[0] % args[1];
                        }

                        return { value, error };
                    },
                    BuiltInFunctions.VerifyInteger),
                ReturnType.Number,
                BuiltInFunctions.ValidateBinaryNumber),
            new ExpressionEvaluator(
                ExpressionType.Average,
                BuiltInFunctions.Apply(
                    (args: ReadonlyArray<any>) => args[0].reduce((x: number, y: number) => x + y) / args[0].length,
                    BuiltInFunctions.VerifyNumericList),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Sum,
                BuiltInFunctions.Apply(
                    (args: ReadonlyArray<any>) => args[0].reduce((x: number, y: number) => x + y),
                    BuiltInFunctions.VerifyNumericList),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Count,
                BuiltInFunctions.Apply(
                    (args: ReadonlyArray<any>) => {
                        let count: number;
                        if (typeof args[0] === 'string' || args[0] instanceof Array) {
                            count = args[0].length;
                        }

                        if (args[0] instanceof Map) {
                            count = args[0].size;
                        }

                        return count;
                    },
                    BuiltInFunctions.VerifyContainer),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Range,
                BuiltInFunctions.ApplyWithError(
                    (args: ReadonlyArray<any>) => {
                        let error: string;
                        if (args[1] <= 0) {
                            error = 'Second paramter must be more than zero';
                        }

                        const result: number[] = [...Array(args[1]).keys()].map((u: number) => u + Number(args[0]));

                        return { value: result, error };
                    },
                    BuiltInFunctions.VerifyInteger
                ),
                ReturnType.Object,
                BuiltInFunctions.ValidateBinaryNumber
            ),
            new ExpressionEvaluator(
                ExpressionType.Union,
                BuiltInFunctions.Apply(
                    (args: ReadonlyArray<any>) => {
                        let result: any[] = [];
                        for (const arg of args) {
                            result = result.concat(arg);
                        }

                        return Array.from(new Set(result));
                    },
                    BuiltInFunctions.VerifyList),
                ReturnType.Object,
                BuiltInFunctions.ValidateAtLeastOne
            ),
            new ExpressionEvaluator(
                ExpressionType.Intersection,
                BuiltInFunctions.Apply(
                    (args: ReadonlyArray<any>) => {
                        let result: any[] = args[0];
                        for (const arg of args) {
                            result = result.filter((e: any) => arg.indexOf(e) > -1);
                        }

                        return Array.from(new Set(result));
                    },
                    BuiltInFunctions.VerifyList),
                ReturnType.Object,
                BuiltInFunctions.ValidateAtLeastOne
            ),
            new ExpressionEvaluator(
                ExpressionType.Skip,
                BuiltInFunctions.Skip,
                ReturnType.Object,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, [], ReturnType.Object, ReturnType.Number),
            ),
            new ExpressionEvaluator(
                ExpressionType.Take,
                BuiltInFunctions.Take,
                ReturnType.Object,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, [], ReturnType.Object, ReturnType.Number),
            ),
            new ExpressionEvaluator(
                ExpressionType.SubArray,
                BuiltInFunctions.SubArray,
                ReturnType.Object,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, [ReturnType.Number], ReturnType.Object, ReturnType.Number),
            ),
            BuiltInFunctions.Comparison(
                ExpressionType.LessThan,
                (args: ReadonlyArray<any>) => args[0] < args[1], BuiltInFunctions.ValidateBinaryNumberOrString, BuiltInFunctions.VerifyNumberOrString),
            BuiltInFunctions.Comparison(
                ExpressionType.LessThanOrEqual,
                (args: ReadonlyArray<any>) => args[0] <= args[1], BuiltInFunctions.ValidateBinaryNumberOrString, BuiltInFunctions.VerifyNumberOrString),
            BuiltInFunctions.Comparison(
                ExpressionType.Equal,
                (args: ReadonlyArray<any>) => args[0] === args[1], BuiltInFunctions.ValidateBinary),
            BuiltInFunctions.Comparison(
                ExpressionType.NotEqual,
                (args: ReadonlyArray<any>) => args[0] !== args[1], BuiltInFunctions.ValidateBinary),
            BuiltInFunctions.Comparison(
                ExpressionType.GreaterThan,
                (args: ReadonlyArray<any>) => args[0] > args[1], BuiltInFunctions.ValidateBinaryNumberOrString, BuiltInFunctions.VerifyNumberOrString),
            BuiltInFunctions.Comparison(
                ExpressionType.GreaterThanOrEqual,
                (args: ReadonlyArray<any>) => args[0] >= args[1], BuiltInFunctions.ValidateBinaryNumberOrString, BuiltInFunctions.VerifyNumberOrString),
            BuiltInFunctions.Comparison(
                ExpressionType.Exists,
                (args: ReadonlyArray<any>) => args[0] !== undefined, BuiltInFunctions.ValidateUnary, BuiltInFunctions.VerifyNumberOrString),
            new ExpressionEvaluator(
                ExpressionType.Contains,
                (expression: Expression, state: any): { value: any; error: string } => {
                    let found: boolean = false;
                    let error: any;
                    let args: ReadonlyArray<any>;
                    ({ args, error } = BuiltInFunctions.EvaluateChildren(expression, state));

                    if (error === undefined) {
                        if (typeof args[0] === 'string' && typeof args[1] === 'string' || args[0] instanceof Array) {
                            found = args[0].includes(args[1]);
                        } else if (args[0] instanceof Map) {
                            found = <Map<string, any>>args[0].get(args[1]) !== undefined;
                        } else if (typeof args[1] === 'string') {
                            let value: any;
                            ({ value, error } = Extensions.AccessProperty(args[0], args[1]));
                            found = error === undefined && value !== undefined;
                        }
                    }

                    return { value: found, error: undefined };
                },
                ReturnType.Boolean,
                BuiltInFunctions.ValidateBinary),
            BuiltInFunctions.Comparison(
                ExpressionType.Empty,
                (args: ReadonlyArray<any>) => this.IsEmpty(args[0]),
                BuiltInFunctions.ValidateUnary,
                BuiltInFunctions.VerifyNumberOrString),
            new ExpressionEvaluator(
                ExpressionType.And,
                (expression: Expression, state: any): { value: any; error: string } => BuiltInFunctions.And(expression, state),
                ReturnType.Boolean,
                BuiltInFunctions.ValidateAtLeastOne),
            new ExpressionEvaluator(
                ExpressionType.Or,
                (expression: Expression, state: any): { value: any; error: string } => BuiltInFunctions.Or(expression, state),
                ReturnType.Boolean,
                BuiltInFunctions.ValidateAtLeastOne),
            new ExpressionEvaluator(
                ExpressionType.Not,
                (expression: Expression, state: any): { value: any; error: string } => BuiltInFunctions.Not(expression, state),
                ReturnType.Boolean,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Concat,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => ''.concat(...args), BuiltInFunctions.VerifyString),
                ReturnType.String,
                BuiltInFunctions.ValidateString),
            new ExpressionEvaluator(
                ExpressionType.Length,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].length, BuiltInFunctions.VerifyString),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.Replace,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].split(args[1]).join(args[2]), BuiltInFunctions.VerifyString),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateArityAndAnyType(expression, 3, 3, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.ReplaceIgnoreCase,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].replace(new RegExp(args[1], 'gi'), args[2]), BuiltInFunctions.VerifyString),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateArityAndAnyType(expression, 3, 3, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.Split,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].split(args[1]), BuiltInFunctions.VerifyString),
                ReturnType.Object,
                (expression: Expression): void => BuiltInFunctions.ValidateArityAndAnyType(expression, 2, 2, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.Substring,
                BuiltInFunctions.Substring,
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, [ReturnType.Number], ReturnType.String, ReturnType.Number)),
            BuiltInFunctions.StringTransform(ExpressionType.ToLower, (args: ReadonlyArray<any>) => String(args[0]).toLowerCase()),
            BuiltInFunctions.StringTransform(ExpressionType.ToUpper, (args: ReadonlyArray<any>) => String(args[0]).toUpperCase()),
            BuiltInFunctions.StringTransform(ExpressionType.Trim, (args: ReadonlyArray<any>) => String(args[0]).trim()),
            new ExpressionEvaluator(
                ExpressionType.StartsWith,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].startsWith(args[1]), BuiltInFunctions.VerifyString),
                ReturnType.Boolean,
                (expression: Expression): void => BuiltInFunctions.ValidateArityAndAnyType(expression, 2, 2, ReturnType.String),
            ),
            new ExpressionEvaluator(
                ExpressionType.EndsWith,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].endsWith(args[1]), BuiltInFunctions.VerifyString),
                ReturnType.Boolean,
                (expression: Expression): void => BuiltInFunctions.ValidateArityAndAnyType(expression, 2, 2, ReturnType.String),
            ),
            new ExpressionEvaluator(
                ExpressionType.CountWord,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].trim().split(/verifys+/).length, BuiltInFunctions.VerifyString),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnaryString
            ),
            new ExpressionEvaluator(
                ExpressionType.AddOrdinal,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => this.AddOrdinal(args[0]), BuiltInFunctions.VerifyInteger),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateArityAndAnyType(expression, 1, 1, ReturnType.Number),
            ),
            new ExpressionEvaluator(
                ExpressionType.Guid,
                BuiltInFunctions.Apply(() => BuiltInFunctions.newGuid()),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateArityAndAnyType(expression, 0, 0),
            ),
            new ExpressionEvaluator(
                ExpressionType.IndexOf,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].indexOf(args[1]), BuiltInFunctions.VerifyString),
                ReturnType.Number,
                (expression: Expression): void => BuiltInFunctions.ValidateArityAndAnyType(expression, 2, 2, ReturnType.String),
            ),
            new ExpressionEvaluator(
                ExpressionType.LastIndexOf,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].lastIndexOf(args[1]), BuiltInFunctions.VerifyString),
                ReturnType.Number,
                (expression: Expression): void => BuiltInFunctions.ValidateArityAndAnyType(expression, 2, 2, ReturnType.String),
            ),
            new ExpressionEvaluator(
                ExpressionType.Join,
                (expression: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: ReadonlyArray<any>;
                    ({ args, error } = BuiltInFunctions.EvaluateChildren(expression, state));
                    if (error === undefined) {
                        if (!(args[0] instanceof Array)) {
                            error = `${expression.Children[0]} evaluates to ${args[0]} which is not a list.`;
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
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, [ReturnType.String], ReturnType.Object, ReturnType.String)),
            // datetime
            BuiltInFunctions.TimeTransform(ExpressionType.AddDays, (ts: moment.Moment, num: any) => ts.add(num, 'd')),
            BuiltInFunctions.TimeTransform(ExpressionType.AddHours, (ts: moment.Moment, num: any) => ts.add(num, 'h')),
            BuiltInFunctions.TimeTransform(ExpressionType.AddMinutes, (ts: moment.Moment, num: any) => ts.add(num, 'minutes')),
            BuiltInFunctions.TimeTransform(ExpressionType.AddSeconds, (ts: moment.Moment, num: any) => ts.add(num, 'seconds')),
            new ExpressionEvaluator(
                ExpressionType.DayOfMonth,
                BuiltInFunctions.ApplyWithError(
                    (args: ReadonlyArray<any>) => BuiltInFunctions.ParseTimestamp(args[0], (dt: moment.Moment) => dt.date()),
                    BuiltInFunctions.VerifyString),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.DayOfWeek,
                BuiltInFunctions.ApplyWithError(
                    (args: ReadonlyArray<any>) => BuiltInFunctions.ParseTimestamp(args[0], (dt: moment.Moment) => dt.days()),
                    BuiltInFunctions.VerifyString),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.DayOfYear,
                BuiltInFunctions.ApplyWithError(
                    (args: ReadonlyArray<any>) => BuiltInFunctions.ParseTimestamp(args[0], (dt: moment.Moment) => dt.dayOfYear()),
                    BuiltInFunctions.VerifyString),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.Month,
                BuiltInFunctions.ApplyWithError(
                    (args: ReadonlyArray<any>) => BuiltInFunctions.ParseTimestamp(args[0], (dt: moment.Moment) => dt.month() + 1),
                    BuiltInFunctions.VerifyString),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.Date,
                BuiltInFunctions.ApplyWithError(
                    (args: ReadonlyArray<any>) => BuiltInFunctions.ParseTimestamp(args[0], (dt: moment.Moment) => dt.format('M/DD/YYYY')),
                    BuiltInFunctions.VerifyString),
                ReturnType.String,
                BuiltInFunctions.ValidateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.Year,
                BuiltInFunctions.ApplyWithError(
                    (args: ReadonlyArray<any>) => BuiltInFunctions.ParseTimestamp(args[0], (dt: moment.Moment) => dt.year()),
                    BuiltInFunctions.VerifyString),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.UtcNow,
                BuiltInFunctions.Apply(
                    (args: ReadonlyArray<any>) => args.length === 1 ? moment(new Date().toISOString()).utc().format(args[0]) : new Date().toISOString(),
                    BuiltInFunctions.VerifyString),
                ReturnType.String),
            new ExpressionEvaluator(
                ExpressionType.FormatDateTime,
                BuiltInFunctions.ApplyWithError(
                    (args: ReadonlyArray<any>) => {
                        let error: string;
                        let arg: any = args[0];
                        if (typeof arg === 'number') {
                            arg = arg * 1000;
                        } else {
                            error = BuiltInFunctions.VerifyTimestamp(arg.toString());
                        }

                        let value: any;
                        if (error === undefined) {
                            const dateString: string = new Date(arg).toISOString();
                            value = args.length === 2 ? moment(dateString).format(BuiltInFunctions.TimestampFormatter(args[1])) : dateString;
                        }

                        return { value, error };
                    }),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, [ReturnType.String], ReturnType.Object)),
            new ExpressionEvaluator(
                ExpressionType.SubtractFromTime,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: any;
                    let args: ReadonlyArray<any>;
                    ({ args, error } = BuiltInFunctions.EvaluateChildren(expr, state));
                    if (error === undefined) {
                        if (typeof args[0] === 'string' && Number.isInteger(args[1]) && typeof args[2] === 'string') {
                            const format: string = (args.length === 4 ? BuiltInFunctions.TimestampFormatter(args[3]) : BuiltInFunctions.DefaultDateTimeFormat);
                            const { duration, tsStr } = BuiltInFunctions.TimeUnitTransformer(args[1], args[2]);
                            if (tsStr === undefined) {
                                error = `${args[2]} is not a valid time unit.`;
                            } else {
                                const dur: any = duration;
                                ({ value, error } = BuiltInFunctions.ParseTimestamp(args[0], dt => args.length === 4 ?
                                    dt.subtract(dur, tsStr).format(format) : dt.subtract(dur, tsStr).toISOString()));
                            }
                        } else {
                            error = `${expr} can't evaluate.`;
                        }
                    }

                    return { value, error };
                },
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, [ReturnType.String], ReturnType.String, ReturnType.Number, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.DateReadBack,
                BuiltInFunctions.ApplyWithError(
                    (args: ReadonlyArray<any>) => {
                        let value: any;
                        let error: string;
                        const dateFormat: string = 'YYYY-MM-DD';
                        ({ value, error } = BuiltInFunctions.ParseTimestamp(args[0]));
                        if (error === undefined) {
                            const timestamp1: Date = new Date(value.format(dateFormat));
                            ({ value, error } = BuiltInFunctions.ParseTimestamp(args[1]));
                            const timestamp2: string = value.format(dateFormat);
                            const timex: TimexProperty = new TimexProperty(timestamp2);

                            return { value: timex.toNaturalLanguage(timestamp1), error };
                        }
                    },
                    BuiltInFunctions.VerifyString),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.String, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.GetTimeOfDay,
                BuiltInFunctions.ApplyWithError(
                    (args: ReadonlyArray<any>) => {
                        let value: any;
                        const error: string = BuiltInFunctions.VerifyISOTimestamp(args[0]);
                        if (error === undefined) {
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
                    this.VerifyString),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.GetFutureTime,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: any;
                    let args: ReadonlyArray<any>;
                    ({ args, error } = BuiltInFunctions.EvaluateChildren(expr, state));
                    if (error === undefined) {
                        if (Number.isInteger(args[0]) && typeof args[1] === 'string') {
                            const format: string = (args.length === 3 ? BuiltInFunctions.TimestampFormatter(args[2]) : BuiltInFunctions.DefaultDateTimeFormat);
                            const { duration, tsStr } = BuiltInFunctions.TimeUnitTransformer(args[0], args[1]);
                            if (tsStr === undefined) {
                                error = `${args[2]} is not a valid time unit.`;
                            } else {
                                const dur: any = duration;
                                ({ value, error } = BuiltInFunctions.ParseTimestamp(new Date().toISOString(), dt => dt.add(dur, tsStr).format(format)));
                            }
                        } else {
                            error = `${expr} can't evaluate.`;
                        }
                    }

                    return { value, error };
                },
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, [ReturnType.String], ReturnType.Number, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.GetPastTime,
                (expr: Expression, state: any): { value: any; error: string } => {
                    let value: any;
                    let error: any;
                    let args: ReadonlyArray<any>;
                    ({ args, error } = BuiltInFunctions.EvaluateChildren(expr, state));
                    if (error === undefined) {
                        if (Number.isInteger(args[0]) && typeof args[1] === 'string') {
                            const format: string = (args.length === 3 ? BuiltInFunctions.TimestampFormatter(args[2]) : BuiltInFunctions.DefaultDateTimeFormat);
                            const { duration, tsStr } = BuiltInFunctions.TimeUnitTransformer(args[0], args[1]);
                            if (tsStr === undefined) {
                                error = `${args[2]} is not a valid time unit.`;
                            } else {
                                const dur: any = duration;
                                ({ value, error } = BuiltInFunctions.ParseTimestamp(new Date().toISOString(), dt => dt.subtract(dur, tsStr).format(format)));
                            }
                        } else {
                            error = `${expr} can't evaluate.`;
                        }
                    }

                    return { value, error };
                },
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, [ReturnType.String], ReturnType.Number, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.ConvertFromUTC,
                (expr: Expression, state: any) : { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: ReadonlyArray<any>;
                    ({args, error} = BuiltInFunctions.EvaluateChildren(expr, state));
                    if (error === undefined) {
                        const format: string = (args.length === 3) ? BuiltInFunctions.TimestampFormatter(args[2]) : this.DefaultDateTimeFormat;
                        if (typeof(args[0]) === 'string' && typeof(args[1]) === 'string') {
                            ({value, error} = BuiltInFunctions.ConvertFromUTC(args[0], args[1], format));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expr: Expression): void => BuiltInFunctions.ValidateOrder(expr, [ReturnType.String], ReturnType.String, ReturnType.String)
                ),
            new ExpressionEvaluator(
                    ExpressionType.ConvertToUTC,
                    (expr: Expression, state: any) : { value: any; error: string } => {
                        let value: any;
                        let error: string;
                        let args: ReadonlyArray<any>;
                        ({args, error} = BuiltInFunctions.EvaluateChildren(expr, state));
                        if (error === undefined) {
                            const format: string = (args.length === 3) ? BuiltInFunctions.TimestampFormatter(args[2]) : this.DefaultDateTimeFormat;
                            if (typeof(args[0]) === 'string' && typeof(args[1]) === 'string') {
                                ({value, error} = BuiltInFunctions.ConvertToUTC(args[0], args[1], format));
                            } else {
                                error = `${expr} cannot evaluate`;
                            }
                        }

                        return {value, error};
                    },
                    ReturnType.String,
                    (expr: Expression): void => BuiltInFunctions.ValidateOrder(expr, [ReturnType.String], ReturnType.String, ReturnType.String)
                    ),
            new ExpressionEvaluator(
                ExpressionType.AddToTime,
                (expr: Expression, state: any) : { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: ReadonlyArray<any>;
                    ({args, error} = BuiltInFunctions.EvaluateChildren(expr, state));
                    if (error === undefined) {
                        const format: string = (args.length === 4) ? BuiltInFunctions.TimestampFormatter(args[3]) : this.DefaultDateTimeFormat;
                        if (typeof(args[0]) === 'string' && Number.isInteger(args[1]) && typeof(args[2]) === 'string') {
                            ({value, error} = BuiltInFunctions.AddToTime(args[0], args[1], args[2], format));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expr: Expression): void => BuiltInFunctions.ValidateOrder(expr, [ReturnType.String], ReturnType.String, ReturnType.Number, ReturnType.String)
                ),
            new ExpressionEvaluator(
                ExpressionType.StartOfDay,
                (expr: Expression, state: any) : { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: ReadonlyArray<any>;
                    ({args, error} = BuiltInFunctions.EvaluateChildren(expr, state));
                    if (error === undefined) {
                        const format: string = (args.length === 2) ? BuiltInFunctions.TimestampFormatter(args[1]) : this.DefaultDateTimeFormat;
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = BuiltInFunctions.StartOfDay(args[0], format));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expr: Expression): void => BuiltInFunctions.ValidateOrder(expr, [ReturnType.String], ReturnType.String)
                ),
            new ExpressionEvaluator(
                ExpressionType.StartOfHour,
                (expr: Expression, state: any) : { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: ReadonlyArray<any>;
                    ({args, error} = BuiltInFunctions.EvaluateChildren(expr, state));
                    if (error === undefined) {
                        const format: string = (args.length === 2) ? BuiltInFunctions.TimestampFormatter(args[1]) : this.DefaultDateTimeFormat;
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = BuiltInFunctions.StartOfHour(args[0], format));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expr: Expression): void => BuiltInFunctions.ValidateOrder(expr, [ReturnType.String], ReturnType.String)
                ),
            new ExpressionEvaluator(
                ExpressionType.StartOfMonth,
                (expr: Expression, state: any) : { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: ReadonlyArray<any>;
                    ({args, error} = BuiltInFunctions.EvaluateChildren(expr, state));
                    if (error === undefined) {
                        const format: string = (args.length === 2) ? BuiltInFunctions.TimestampFormatter(args[1]) : this.DefaultDateTimeFormat;
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = BuiltInFunctions.StartOfMonth(args[0], format));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expr: Expression): void => BuiltInFunctions.ValidateOrder(expr, [ReturnType.String], ReturnType.String)
                ),
            new ExpressionEvaluator(
                ExpressionType.Ticks,
                (expr: Expression, state: any) : { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: ReadonlyArray<any>;
                    ({args, error} = BuiltInFunctions.EvaluateChildren(expr, state));
                    if (error === undefined) {
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = BuiltInFunctions.Ticks(args[0]));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.Number,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriHost,
                (expr: Expression, state: any) : { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: ReadonlyArray<any>;
                    ({args, error} = BuiltInFunctions.EvaluateChildren(expr, state));
                    if (error === undefined) {
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = BuiltInFunctions.UriHost(args[0]));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriPath,
                (expr: Expression, state: any) : { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: ReadonlyArray<any>;
                    ({args, error} = BuiltInFunctions.EvaluateChildren(expr, state));
                    if (error === undefined) {
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = BuiltInFunctions.UriPath(args[0]));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriPathAndQuery,
                (expr: Expression, state: any) : { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: ReadonlyArray<any>;
                    ({args, error} = BuiltInFunctions.EvaluateChildren(expr, state));
                    if (error === undefined) {
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = BuiltInFunctions.UriPathAndQuery(args[0]));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriQuery,
                (expr: Expression, state: any) : { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: ReadonlyArray<any>;
                    ({args, error} = BuiltInFunctions.EvaluateChildren(expr, state));
                    if (error === undefined) {
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = BuiltInFunctions.UriQuery(args[0]));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriPort,
                (expr: Expression, state: any) : { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: ReadonlyArray<any>;
                    ({args, error} = BuiltInFunctions.EvaluateChildren(expr, state));
                    if (error === undefined) {
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = BuiltInFunctions.UriPort(args[0]));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.Number,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriScheme,
                (expr: Expression, state: any) : { value: any; error: string } => {
                    let value: any;
                    let error: string;
                    let args: ReadonlyArray<any>;
                    ({args, error} = BuiltInFunctions.EvaluateChildren(expr, state));
                    if (error === undefined) {
                        if (typeof(args[0]) === 'string') {
                            ({value, error} = BuiltInFunctions.UriScheme(args[0]));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Float,
                BuiltInFunctions.ApplyWithError(
                    (args: ReadonlyArray<any>) => {
                        let error: string;
                        const value: number = parseFloat(args[0]);
                        if (value === undefined || Number.isNaN(value)) {
                            error = `parameter ${args[0]} is not a valid number string.`;
                        }

                        return { value, error };
                    }),
                ReturnType.Number, BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Int,
                BuiltInFunctions.ApplyWithError(
                    (args: ReadonlyArray<any>) => {
                        let error: string;
                        const value: number = parseInt(args[0], 10);
                        if (value === undefined || Number.isNaN(value)) {
                            error = `parameter ${args[0]} is not a valid number string.`;
                        }

                        return { value, error };
                    }),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.String,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    return JSON.stringify(args[0])
                        .replace(/(^\'*)/g, '')
                        .replace(/(\'*$)/g, '')
                        .replace(/(^\"*)/g, '')
                        .replace(/(\"*$)/g, '');
                }),
                ReturnType.String,
                BuiltInFunctions.ValidateUnary),
            BuiltInFunctions.Comparison(
                ExpressionType.Bool,
                (args: ReadonlyArray<any>) => this.IsLogicTrue(args[0]),
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(ExpressionType.Accessor, BuiltInFunctions.Accessor, ReturnType.Object, BuiltInFunctions.ValidateAccessor),
            new ExpressionEvaluator(
                ExpressionType.GetProperty,
                BuiltInFunctions.GetProperty,
                ReturnType.Object,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.Object, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.If,
                (expression: Expression, state: any): { value: any; error: string } => BuiltInFunctions.If(expression, state),
                ReturnType.Object,
                (expr: Expression): void => BuiltInFunctions.ValidateArityAndAnyType(expr, 3, 3)),
            new ExpressionEvaluator(
                ExpressionType.Rand,
                BuiltInFunctions.ApplyWithError(
                    (args: ReadonlyArray<any>) => {
                        let error: string
                        if (args[0] > args[1]) {
                            error = `Min value ${args[0]} cannot be greater than max value ${args[1]}.`;
                        }

                        const value: any = Math.floor(Math.random() * (Number(args[1]) - Number(args[0])) + Number(args[0]));

                        return { value, error };
                    },
                    BuiltInFunctions.VerifyInteger),
                ReturnType.Number,
                BuiltInFunctions.ValidateBinaryNumber),
            new ExpressionEvaluator(ExpressionType.CreateArray, BuiltInFunctions.Apply((args: ReadonlyArray<any>) => Array.from(args)), ReturnType.Object),
            new ExpressionEvaluator(
                ExpressionType.Array,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => [args[0]], BuiltInFunctions.VerifyString),
                ReturnType.Object,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Binary,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => this.ToBinary(args[0]), BuiltInFunctions.VerifyString),
                ReturnType.String,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.DataUri,
                BuiltInFunctions.Apply(
                    (args: Readonly<any>) => 'data:text/plain;charset=utf-8;base64,'.concat(Buffer.from(args[0]).toString('base64')), BuiltInFunctions.VerifyString),
                ReturnType.String,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.DataUriToBinary,
                BuiltInFunctions.Apply((args: Readonly<any>) => this.ToBinary(args[0]), BuiltInFunctions.VerifyString),
                ReturnType.String,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.DataUriToString,
                BuiltInFunctions.Apply((args: Readonly<any>) => Buffer.from(args[0].slice(args[0].indexOf(',') + 1), 'base64').toString(), BuiltInFunctions.VerifyString),
                ReturnType.String,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriComponentToString,
                BuiltInFunctions.Apply((args: Readonly<any>) => decodeURIComponent(args[0]), BuiltInFunctions.VerifyString),
                ReturnType.String,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Base64,
                BuiltInFunctions.Apply((args: Readonly<any>) => Buffer.from(args[0]).toString('base64'), BuiltInFunctions.VerifyString),
                ReturnType.String,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Base64ToBinary,
                BuiltInFunctions.Apply((args: Readonly<any>) => this.ToBinary(args[0]), BuiltInFunctions.VerifyString),
                ReturnType.String,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Base64ToString,
                BuiltInFunctions.Apply((args: Readonly<any>) => Buffer.from(args[0], 'base64').toString(), BuiltInFunctions.VerifyString),
                ReturnType.String,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriComponent,
                BuiltInFunctions.Apply((args: Readonly<any>) => encodeURIComponent(args[0]), BuiltInFunctions.VerifyString),
                ReturnType.String,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Xml,
                BuiltInFunctions.ApplyWithError((args: Readonly<any>) => this.ToXml(args[0]), BuiltInFunctions.VerifyString),
                ReturnType.String,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.First,
                BuiltInFunctions.Apply(
                    (args: ReadonlyArray<any>) => {
                        let first: any;
                        if (typeof args[0] === 'string' && args[0].length > 0) {
                            first = args[0][0];
                        }

                        if (args[0] instanceof Array && args[0].length > 0) {
                            first = Extensions.AccessIndex(args[0], 0).value;
                        }

                        return first;
                    }),
                ReturnType.Object,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Last,
                BuiltInFunctions.Apply(
                    (args: ReadonlyArray<any>) => {
                        let last: any;
                        if (typeof args[0] === 'string' && args[0].length > 0) {
                            last = args[0][args[0].length - 1];
                        }

                        if (args[0] instanceof Array && args[0].length > 0) {
                            last = Extensions.AccessIndex(args[0], args[0].length - 1).value;
                        }

                        return last;
                    }),
                ReturnType.Object,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Json,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => JSON.parse(args[0])),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.AddProperty,
                BuiltInFunctions.Apply(
                    (args: ReadonlyArray<any>) => {
                        const temp: any = args[0];
                        temp[String(args[1])] = args[2];

                        return temp;
                    }),
                ReturnType.Object,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.Object, ReturnType.String, ReturnType.Object)),
            new ExpressionEvaluator(
                ExpressionType.SetProperty,
                BuiltInFunctions.Apply(
                    (args: ReadonlyArray<any>) => {
                        const temp: any = args[0];
                        temp[String(args[1])] = args[2];

                        return temp;
                    }),
                ReturnType.Object,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.Object, ReturnType.String, ReturnType.Object)),
            new ExpressionEvaluator(
                ExpressionType.RemoveProperty,
                BuiltInFunctions.Apply(
                    (args: ReadonlyArray<any>) => {
                        const temp: any = args[0];
                        delete temp[String(args[1])];

                        return temp;
                    }),
                ReturnType.Object,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.Object, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.SetPathToValue,
                this.SetPathToValue,
                ReturnType.Object,
                this.ValidateBinary),
            new ExpressionEvaluator(ExpressionType.Select, BuiltInFunctions.Foreach, ReturnType.Object, BuiltInFunctions.ValidateForeach),
            new ExpressionEvaluator(ExpressionType.Foreach, BuiltInFunctions.Foreach, ReturnType.Object, BuiltInFunctions.ValidateForeach),
            new ExpressionEvaluator(ExpressionType.Where, BuiltInFunctions.Where, ReturnType.Object, BuiltInFunctions.ValidateWhere),

            //URI Parsing Functions
            new ExpressionEvaluator(ExpressionType.UriHost, BuiltInFunctions.ApplyWithError((args: Readonly<any>) => this.UriHost(args[0]), BuiltInFunctions.VerifyString),
                                    ReturnType.String, BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(ExpressionType.UriPath, BuiltInFunctions.ApplyWithError((args: Readonly<any>) => this.UriPath(args[0]), BuiltInFunctions.VerifyString),
                                    ReturnType.String, BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(ExpressionType.UriPathAndQuery,
                                    BuiltInFunctions.ApplyWithError((args: Readonly<any>) => this.UriPathAndQuery(args[0]), BuiltInFunctions.VerifyString),
                                    ReturnType.String, BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(ExpressionType.UriQuery, BuiltInFunctions.ApplyWithError((args: Readonly<any>) => this.UriQuery(args[0]), BuiltInFunctions.VerifyString), 
                                    ReturnType.String, BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(ExpressionType.UriPort, BuiltInFunctions.ApplyWithError((args: Readonly<any>) => this.UriPort(args[0]), BuiltInFunctions.VerifyString), 
                                    ReturnType.String, BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(ExpressionType.UriScheme, BuiltInFunctions.ApplyWithError((args: Readonly<any>) => this.UriScheme(args[0]), BuiltInFunctions.VerifyString), 
                                    ReturnType.String, BuiltInFunctions.ValidateUnary),
        
            new ExpressionEvaluator(ExpressionType.Coalesce, BuiltInFunctions.Apply((args: ReadonlyArray<any>[]) => this.Coalesce(<object []>args)),
                                    ReturnType.Object, BuiltInFunctions.ValidateAtLeastOne),
            new ExpressionEvaluator(ExpressionType.XPath, BuiltInFunctions.ApplyWithError((args: ReadonlyArray<any>[]) => this.XPath(args[0].toString(), args[1].toString())),
                                    ReturnType.Object, (expr: Expression): void => BuiltInFunctions.ValidateOrder(expr, undefined, ReturnType.String, ReturnType.String)),
            new ExpressionEvaluator(ExpressionType.JPath, BuiltInFunctions.ApplyWithError((args: ReadonlyArray<any>[]) => this.JPath(args[0], args[1].toString())),
                                    ReturnType.Object, (expr: Expression): void => BuiltInFunctions.ValidateOrder(expr, undefined, ReturnType.Object, ReturnType.String)),

            // Regex expression functions
            new ExpressionEvaluator(
                ExpressionType.IsMatch,
                BuiltInFunctions.ApplyWithError(
                    (args: ReadonlyArray<any>) => {
                       let value: boolean = false;
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
                BuiltInFunctions.ValidateIsMatch),

            // Shorthand functions
            new ExpressionEvaluator(ExpressionType.Callstack, this.Callstack, ReturnType.Object, this.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.SimpleEntity,
                BuiltInFunctions.Apply(
                    (args: ReadonlyArray<any>) => {
                        let result: any = args[0];
                        while (Array.isArray(result) && result.length === 1) {
                            result = result[0];
                        }

                        return result;
                    }),
                ReturnType.Object,
                this.ValidateUnary)
        ];

        const lookup: Map<string, ExpressionEvaluator> = new Map<string, ExpressionEvaluator>();
        functions.forEach((func: ExpressionEvaluator) => {
            lookup.set(func.Type, func);
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
        lookup.set('concat', lookup.get(ExpressionType.Concat));

        return lookup;
    }
}
