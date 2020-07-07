import {TimexProperty} from '@microsoft/recognizers-text-data-types-timex-expression';
import * as jsPath from 'jspath';
import * as lodash from 'lodash';
import moment, {Moment, parseZone} from 'moment';
import {tz} from 'moment-timezone';
import {CommonRegex} from './commonRegex';
import {Constant} from './constant';
import {Expression, ReturnType} from './expression';
import {EvaluateExpressionDelegate, ExpressionEvaluator, ValidateExpressionDelegate} from './expressionEvaluator';
import {ExpressionType} from './expressionType';
import {TimeZoneConverter} from './timeZoneConverter';
import {convertCSharpDateTimeToMomentJS} from './datetimeFormatConverter';
import {MemoryInterface, SimpleObjectMemory, StackedMemory} from './memory';
import {Options} from './options';
import atob = require('atob-lite');
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
     * The default date time format string of a none UTC timestamp.
     */
    public static readonly NoneUtcDefaultDateTimeFormat: string = 'YYYY-MM-DDTHH:mm:ss.SSSZ';

    /**
     * constant of converting unix timestamp to ticks
     */
    public static readonly UnixMilliSecondToTicksConstant: bigInt.BigInteger = bigInt('621355968000000000');

    /**
     * ticks of one day
     */
    public static readonly TicksPerDay: number = 24 * 60 * 60 * 10000000;

    /**
     * ticks of one hour
     */
    public static readonly TicksPerHour: number = 60 * 60 * 10000000;

    /**
     * ticks of one minute
     */
    public static readonly TicksPerMinute: number = 60 * 10000000;

    /**
     * Constant to convert between ticks and ms.
     */
    public static readonly MillisecondToTickConstant: bigInt.BigInteger = bigInt('10000');

    /**
     * Validate that expression has a certain number of children that are of any of the supported types.
     * @param expression Expression to validate.
     * @param minArity Minimum number of children.
     * @param maxArity Maximum number of children.
     * @param returnType  Allowed return types for children.
     * If a child has a return type of Object then validation will happen at runtime.
     */
    public static validateArityAndAnyType(expression: Expression, minArity: number, maxArity: number, returnType: ReturnType = ReturnType.Object): void {
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
            throw new Error(optional.length === 0 ?
                `${expression} should have ${types.length} children.`
                : `${expression} should have between ${types.length} and ${types.length + optional.length} children.`);
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
     * Validate there is a single boolean argument.
     * @param expression Expression to validate.
     */
    public static validateUnaryBoolean(expression: Expression): void {
        FunctionUtils.validateOrder(expression, undefined, ReturnType.Boolean);
    }

    /**
     * Verify value is numeric.
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyNumber(value: any, expression: Expression, _: number): string {
        let error: string;
        if (!FunctionUtils.isNumber(value)) {
            error = `${expression} is not a number.`;
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
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyNumericList(value: any, expression: Expression, _: number): string {
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
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static verifyContainer(value: any, expression: Expression, _: number): string {
        let error: string;
        if (!(typeof value === 'string') && !Array.isArray(value) && !(value instanceof Map) && !(typeof value === 'object')) {
            error = `${expression} must be a string, list, map or object.`;
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
    public static verifyList(value: any, expression: Expression): string {
        let error: string;
        if (!Array.isArray(value)) {
            error = `${expression} is not a list or array.`;
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
            error = `${expression} is not a string.`;
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
            error = `${expression} is neither a string nor a null object.`;
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
        if (typeof value !== 'string' && value !== undefined && !FunctionUtils.isNumber(value)) {
            error = `${expression} is neither a number nor string`;
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
        if (value === undefined || (!FunctionUtils.isNumber(value) && typeof value !== 'string')) {
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
    public static verifyBoolean(value: any, expression: Expression, _: number): string {
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
    public static verifyTimestamp(value: any): string {
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
    public static verifyISOTimestamp(value: any): string {
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
    public static evaluateChildren(expression: Expression, state: MemoryInterface, options: Options, verify?: VerifyExpression): {args: any[]; error: string} {
        const args: any[] = [];
        let value: any;
        let error: string;
        let pos = 0;
        for (const child of expression.children) {
            ({value, error} = child.tryEvaluate(state, options));
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

        return {args, error};
    }

    /**
     * Generate an expression delegate that applies function after verifying all children.
     * @param func Function to apply.
     * @param verify Function to check each arg for validity.
     * @returns Delegate for evaluating an expression.
     */
    public static apply(func: (arg0: any[]) => any, verify?: VerifyExpression): EvaluateExpressionDelegate {
        return (expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} => {
            let value: any;
            let error: string;
            let args: any[];
            ({args, error} = FunctionUtils.evaluateChildren(expression, state, options, verify));
            if (!error) {
                try {
                    value = func(args);
                } catch (e) {
                    error = e.message;
                }
            }

            return {value, error};
        };
    }

    /**
     * Generate an expression delegate that applies function after verifying all children.
     * @param func Function to apply.
     * @param verify Function to check each arg for validity.
     * @returns Delegate for evaluating an expression.
     */
    public static applyWithError(func: (arg0: any[]) => any, verify?: VerifyExpression): EvaluateExpressionDelegate {
        return (expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} => {
            let value: any;
            let error: string;
            let args: any[];
            ({args, error} = FunctionUtils.evaluateChildren(expression, state, options, verify));
            if (!error) {
                try {
                    ({value, error} = func(args));
                } catch (e) {
                    error = e.message;
                }
            }

            return {value, error};
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
    public static numeric(type: string, func: (arg0: any[]) => any): ExpressionEvaluator {
        return new ExpressionEvaluator(type, FunctionUtils.applySequence(func, FunctionUtils.verifyNumber),
            ReturnType.Number, FunctionUtils.validateNumber);
    }

    /**
     * Lookup a property in IDictionary, JObject or through reflection.
     * @param instance Instance with property.
     * @param property Property to lookup.
     * @returns Value and error information if any.
     */
    public static accessProperty(instance: any, property: string): {value: any; error: string} {
        // NOTE: This returns null rather than an error if property is not present
        if (!instance) {
            return {value: undefined, error: undefined};
        }

        let value: any;
        let error: string;
        // todo, Is there a better way to access value, or any case is not listed below?
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

        return {value, error};
    }

    /**
     * Set a property in Map or Object.
     * @param instance Instance to set.
     * @param property Property to set.
     * @param value Value to set.
     * @returns set value.
     */
    public static setProperty(instance: any, property: string, value: any): {value: any; error: string} {
        const result: any = value;
        if (instance instanceof Map) {
            instance.set(property, value);
        } else {
            instance[property] = value;
        }

        return {value: result, error: undefined};
    }

    /**
     * Lookup a property in IDictionary, JObject or through reflection.
     * @param instance Instance with property.
     * @param property Property to lookup.
     * @returns Value and error information if any.
     */
    public static accessIndex(instance: any, index: number): {value: any; error: string} {
        // NOTE: This returns null rather than an error if property is not present
        if (instance === null || instance === undefined) {
            return {value: undefined, error: undefined};
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

        return {value, error};
    }

    public static parseTimestamp(timeStamp: string, transform?: (arg0: Date) => any): {value: any; error: string} {
        let value: any;
        const error: string = this.verifyISOTimestamp(timeStamp);
        if (!error) {
            value = transform !== undefined ? transform(new Date(timeStamp)) : timeStamp;
        }

        return {value, error};
    }

    public static timestampFormatter(formatter: string): string {
        let result = formatter;
        try {
            result = convertCSharpDateTimeToMomentJS(formatter);
        } catch (e) {
            // do nothing
        }

        return result;
    }

    public static timeUnitTransformer(duration: number, cSharpStr: string): {duration: number; tsStr: string} {
        switch (cSharpStr) {
            case 'Day': return {duration, tsStr: 'days'};
            case 'Week': return {duration: duration * 7, tsStr: 'days'};
            case 'Second': return {duration, tsStr: 'seconds'};
            case 'Minute': return {duration, tsStr: 'minutes'};
            case 'Hour': return {duration, tsStr: 'hours'};
            case 'Month': return {duration, tsStr: 'months'};
            case 'Year': return {duration, tsStr: 'years'};
            default: return {duration, tsStr: undefined};
        }
    }

    public static buildTypeValidatorError(returnType: ReturnType, childExpr: Expression, expr: Expression): string {
        const names = Object.keys(ReturnType).filter((x): boolean => !(parseInt(x) >= 0));
        let types = [];
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

    public static parseTimexProperty(timexExpr: any): {timexProperty: TimexProperty; error: string} {
        let parsed: TimexProperty;
        if (timexExpr instanceof TimexProperty) {
            parsed = timexExpr;
        } else if (typeof timexExpr === 'string') {
            parsed = new TimexProperty(timexExpr);
        } else {
            parsed = new TimexProperty(timexExpr);
            if (parsed === undefined || Object.keys(parsed).length === 0) {
                return {timexProperty: parsed, error: `${timexExpr} requires a TimexProperty or a string as a argument`};
            }
        }

        return {timexProperty: parsed, error: undefined};
    }

    public static newGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: any): string => {
            const r: number = Math.random() * 16 | 0;
            const v: number = c === 'x' ? r : (r & 0x3 | 0x8);

            return v.toString(16);
        });
    }

    public static parseStringOrNull(input: string | undefined): string {
        if (typeof input === 'string') {
            return input;
        } else {
            return '';
        }
    }

    /**
     * Try to accumulate the path from an Accessor or Element, from right to left
     * return the accumulated path and the expression left unable to accumulate
     * @param expression
     * @param state scope
     * @param options Options used in evaluation
     */
    public static tryAccumulatePath(expression: Expression, state: MemoryInterface, options: Options): {path: string; left: Expression; error: string} {
        let path = '';
        let left = expression;
        while (left !== undefined) {
            if (left.type === ExpressionType.Accessor) {
                path = (left.children[0] as Constant).value + '.' + path;
                left = left.children.length === 2 ? left.children[1] : undefined;
            } else if (left.type === ExpressionType.Element) {
                let value: any;
                let error: string;
                ({value, error} = left.children[1].tryEvaluate(state, options));

                if (error !== undefined) {
                    return {path: undefined, left: undefined, error};
                }

                if (FunctionUtils.isNumber(parseInt(value))) {
                    path = `[${value}].${path}`;
                } else if (typeof value === 'string') {
                    path = `['${value}'].${path}`;
                } else {
                    return {path: undefined, left: undefined, error: `${left.children[1].toString()} doesn't return an int or string`};
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

        return {path, left, error: undefined};
    }

    public static accessor(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let path: string;
        let left: Expression;
        let error: string;
        ({path, left, error} = FunctionUtils.tryAccumulatePath(expression, state, options));
        if (error) {
            return {value: undefined, error};
        }

        if (left == undefined) {
            // fully converted to path, so we just delegate to memory scope
            return {value: FunctionUtils.wrapGetValue(state, path, options), error: undefined};
        } else {
            let newScope: any;
            let err: string;
            ({value: newScope, error: err} = left.tryEvaluate(state, options));
            if (err) {
                return {value: undefined, error: err};
            }

            return {value: FunctionUtils.wrapGetValue(new SimpleObjectMemory(newScope), path, options), error: undefined};
        }
    }

    public static getProperty(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: string;
        let firstItem: any;
        let property: any;

        const children: Expression[] = expression.children;
        ({value: firstItem, error} = children[0].tryEvaluate(state, options));
        if (!error) {
            if (children.length === 1) {
                // get root value from memory
                if (typeof firstItem === 'string') {
                    value = FunctionUtils.wrapGetValue(state, firstItem, options);
                } else {
                    error = `"Single parameter ${ children[0] } is not a string."`;
                }
            } else {
                // get the peoperty value from the instance
                ({value: property, error} = children[1].tryEvaluate(state, options));

                if (!error) {
                    value = FunctionUtils.wrapGetValue(new SimpleObjectMemory(firstItem), property.toString(), options);
                }
            }
        }

        return {value, error};
    }

    public static coalesce(objetcList: object[]): any {
        for (const obj of objetcList) {
            if (obj !== null && obj !== undefined) {
                return obj;
            }
        }

        return undefined;
    }

    public static jPath(jsonEntity: object | string, path: string): {value: any; error: string} {
        let result: any;
        let error: string;
        let evaled: any;
        let json: object;
        if (typeof jsonEntity === 'string') {
            try {
                json = JSON.parse(jsonEntity);
            } catch (e) {
                error = `${jsonEntity} is not a valid json string`;
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
                error = `${path} is not a valid path + ${e}`;
            }
        }

        result = evaled;

        return {value: result, error};
    }

    public static wrapGetValue(state: MemoryInterface, path: string, options: Options): any {
        let result = state.getValue(path);
        if (result !== undefined && result !== null) {
            return result;
        }

        if (options.nullSubstitution !== undefined) {
            return options.nullSubstitution(path);
        }

        return undefined;
    }

    public static setPathToValue(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let path: string;
        let left: Expression;
        let error: string;
        ({path, left, error} = FunctionUtils.tryAccumulatePath(expression.children[0], state, options));
        if (error !== undefined) {
            return {value: undefined, error};
        }

        if (left) {
            // the expression can't be fully merged as a path
            return {value: undefined, error: `${expression.children[0].toString()} is not a valid path to set value`};
        }
        let value: any;
        let err: string;
        ({value, error: err} = expression.children[1].tryEvaluate(state, options));
        if (err) {
            return {value: undefined, error: err};
        }

        state.setValue(path, value);
        return {value, error: undefined};
    }

    public static foreach(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let result: any[];
        let error: string;
        let instance: any;

        ({value: instance, error} = expression.children[0].tryEvaluate(state, options));
        if (!instance) {
            error = `'${expression.children[0]}' evaluated to null.`;
        }

        if (!error) {
            const iteratorName = (expression.children[1].children[0] as Constant).value as string;
            let arr = [];
            if (Array.isArray(instance)) {
                arr = instance;
            } else if (typeof instance === 'object') {
                Object.keys(instance).forEach((u): number => arr.push({key: u, value: instance[u]}));
            } else {
                error = `${expression.children[0]} is not a collection or structure object to run foreach`;
            }

            if (!error) {
                const stackedMemory = StackedMemory.wrap(state);
                result = [];
                for (const item of arr) {
                    const local: Map<string, any> = new Map<string, any>([
                        [iteratorName, item]
                    ]);

                    stackedMemory.push(SimpleObjectMemory.wrap(local));
                    const {value: r, error: e} = expression.children[2].tryEvaluate(stackedMemory, options);
                    stackedMemory.pop();
                    if (e !== undefined) {
                        return {value: undefined, error: e};
                    }
                    result.push(r);
                }
            }
        }

        return {value: result, error};
    }

    public static where(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let result: any;
        let error: string;
        let instance: any;

        ({value: instance, error} = expression.children[0].tryEvaluate(state, options));

        if (!error) {
            const iteratorName = (expression.children[1].children[0] as Constant).value as string;
            let arr: any[] = [];
            let isInstanceArray = false;
            if (Array.isArray(instance)) {
                arr = instance;
                isInstanceArray = true;
            } else if (typeof instance === 'object') {
                Object.keys(instance).forEach((u): number => arr.push({key: u, value: instance[u]}));
            } else {
                error = `${expression.children[0]} is not a collection or structure object to run foreach`;
            }

            if (!error) {
                const stackedMemory = StackedMemory.wrap(state);
                const arrResult = [];
                for (const item of arr) {
                    const local: Map<string, any> = new Map<string, any>([
                        [iteratorName, item]
                    ]);

                    stackedMemory.push(SimpleObjectMemory.wrap(local));
                    const newOptions = new Options(options);
                    newOptions.nullSubstitution = undefined;
                    const {value: r, error: e} = expression.children[2].tryEvaluate(stackedMemory, newOptions);
                    stackedMemory.pop();
                    if (e !== undefined) {
                        return {value: undefined, error: e};
                    }

                    if ((Boolean(r))) {
                        arrResult.push(local.get(iteratorName));
                    }
                }

                //reconstruct object if instance is object, otherwise, return array result
                if (!isInstanceArray) {
                    let objResult = {};
                    for (const item of arrResult) {
                        objResult[item.key] = item.value;
                    }

                    result = objResult;
                } else {
                    result = arrResult;
                }
            }
        }

        return {value: result, error};
    }

    public static validateWhere(expression: Expression): void {
        FunctionUtils.validateForeach(expression);
    }

    public static validateForeach(expression: Expression): void {
        if (expression.children.length !== 3) {
            throw new Error(`foreach expect 3 parameters, found ${expression.children.length}`);
        }

        const second: Expression = expression.children[1];
        if (!(second.type === ExpressionType.Accessor && second.children.length === 1)) {
            throw new Error(`Second parameter of foreach is not an identifier : ${second}`);
        }
    }

    public static validateIsMatch(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, 2, ReturnType.String);

        const second: Expression = expression.children[1];
        if (second.returnType === ReturnType.String && second.type === ExpressionType.Constant) {
            CommonRegex.CreateRegex((second as Constant).value.toString());
        }
    }

    public static isNumber(instance: any): boolean {
        return instance !== undefined && instance !== null && typeof instance === 'number' && !Number.isNaN(instance);
    }

    public static isEmpty(instance: any): boolean {
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
    public static isLogicTrue(instance: any): boolean {
        let result = true;

        if (typeof instance === 'boolean') {
            result = instance;
        } else if (instance === undefined || instance === null) {
            result = false;
        }

        return result;
    }

    public static _if(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let result: any;
        let error: string;
        const newOptions = new Options(options);
        newOptions.nullSubstitution = undefined;
        ({value: result, error} = expression.children[0].tryEvaluate(state, newOptions));
        if (!error && this.isLogicTrue(result)) {
            ({value: result, error} = expression.children[1].tryEvaluate(state, options));
        } else {
            ({value: result, error} = expression.children[2].tryEvaluate(state, options));
        }

        return {value: result, error};
    }



    

    public static sortBy(isDescending: boolean): EvaluateExpressionDelegate {
        return (expression: Expression, state: any, options: Options): {value: any; error: string} => {
            let result: any;
            let error: string;
            let oriArr: any;
            ({value: oriArr, error} = expression.children[0].tryEvaluate(state, options));
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
                        ({value: propertyName, error} = expression.children[1].tryEvaluate(state, options));

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
                    error = `${expression.children[0]} is not array`;
                }

            }

            return {value: result, error};
        };
    }

    

    public static toBinary(stringToConvert: string): Uint8Array {
        let result = new ArrayBuffer(stringToConvert.length);
        let bufferView = new Uint8Array(result);
        for (let i = 0; i < stringToConvert.length; i++) {
            bufferView[i] = stringToConvert.charCodeAt(i);
        }

        return bufferView;
    }

    public static returnFormattedTimeStampStr(timedata: Moment, format: string): {value: any; error: string} {
        let result: string;
        let error: string;
        try {
            result = timedata.format(format);
        } catch (e) {
            error = `${format} is not a valid timestamp format`;
        }

        return {value: result, error};
    }

    public static convertFromUTC(timeStamp: string, destinationTimeZone: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        error = this.verifyISOTimestamp(timeStamp);
        const timeZone: string = TimeZoneConverter.windowsToIana(destinationTimeZone);
        if (!TimeZoneConverter.verifyTimeZoneStr(timeZone)) {
            error = `${destinationTimeZone} is not a valid timezone`;
        }

        if (!error) {
            try {
                result = tz(timeStamp, timeZone).format(format);
            } catch (e) {
                error = `${format} is not a valid timestamp format`;
            }
        }

        return {value: result, error};
    }

    public static verifyTimeStamp(timeStamp: string): string {
        let parsed: any;
        let error: string;
        parsed = moment(timeStamp);
        if (parsed.toString() === 'Invalid date') {
            error = `${timeStamp} is a invalid datetime`;
        }

        return error;
    }

    public static convertToUTC(timeStamp: string, sourceTimezone: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let formattedSourceTime: string;
        const timeZone: string = TimeZoneConverter.windowsToIana(sourceTimezone);
        if (!TimeZoneConverter.verifyTimeZoneStr(timeZone)) {
            error = `${sourceTimezone} is not a valid timezone`;
        }

        if (!error) {
            error = this.verifyTimeStamp(timeStamp);
            if (!error) {
                try {
                    const sourceTime = tz(timeStamp, timeZone);
                    formattedSourceTime = sourceTime.format();
                } catch (e) {
                    error = `${timeStamp} with ${timeZone} is not a valid timestamp with specified timeZone:`;
                }

                if (!error) {
                    try {
                        result = tz(formattedSourceTime, 'Etc/UTC').format(format);
                    } catch (e) {
                        error = `${format} is not a valid timestamp format`;
                    }
                }
            }
        }

        return {value: result, error};
    }

    public static ticks(timeStamp: string): {value: any; error: string} {
        let parsed: any;
        let result: any;
        let error: string;
        ({value: parsed, error} = FunctionUtils.parseTimestamp(timeStamp));
        if (!error) {
            const unixMilliSec: number = parseInt(moment(parsed).utc().format('x'), 10);
            result = this.UnixMilliSecondToTicksConstant.add(bigInt(unixMilliSec).times(this.MillisecondToTickConstant));
        }

        return {value: result, error};
    }

    public static startOfDay(timeStamp: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: any;
        ({value: parsed, error} = FunctionUtils.parseTimestamp(timeStamp));
        if (!error) {
            const startOfDay = moment(parsed).utc().hours(0).minutes(0).second(0).millisecond(0);
            ({value: result, error} = FunctionUtils.returnFormattedTimeStampStr(startOfDay, format));
        }

        return {value: result, error};
    }

    public static startOfHour(timeStamp: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: any;
        ({value: parsed, error} = FunctionUtils.parseTimestamp(timeStamp));
        if (!error) {
            const startofHour = moment(parsed).utc().minutes(0).second(0).millisecond(0);
            ({value: result, error} = FunctionUtils.returnFormattedTimeStampStr(startofHour, format));
        }

        return {value: result, error};
    }

    public static startOfMonth(timeStamp: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: any;
        ({value: parsed, error} = FunctionUtils.parseTimestamp(timeStamp));
        if (!error) {
            const startofMonth = moment(parsed).utc().date(1).hours(0).minutes(0).second(0).millisecond(0);
            ({value: result, error} = FunctionUtils.returnFormattedTimeStampStr(startofMonth, format));
        }

        return {value: result, error};
    }

    // Uri Parsing Function
    public static parseUri(uri: string): {value: any; error: string} {
        let result: URL;
        let error: string;
        try {
            result = new URL(uri);
        } catch (e) {
            error = `Invalid URI: ${uri}`;
        }

        return {value: result, error};
    }

    public static uriHost(uri: string): {value: any; error: string} {
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

    public static uriPath(uri: string): {value: any; error: string} {
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

    public static uriPathAndQuery(uri: string): {value: any; error: string} {
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

    public static uriPort(uri: string): {value: any; error: string} {
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

    public static uriQuery(uri: string): {value: any; error: string} {
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

    public static uriScheme(uri: string): {value: any; error: string} {
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

    public static getPropertyCount(obj: any): number {
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



    public static commonStringify(input: any): string {
        if (input === null || input === undefined) {
            return '';
        }
    
        if (Array.isArray(input)) {
            return input.toString();
        } else if (typeof input === 'object') {
            return JSON.stringify(input);
        } else {
            return input.toString();
        }
    }
}