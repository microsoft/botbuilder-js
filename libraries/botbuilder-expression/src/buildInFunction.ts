
/**
 * @module botbuilder-expression
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as moment from 'moment';
import { Constant } from './constant';
import { Expression, ReturnType } from './expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator, ValidateExpressionDelegate } from './expressionEvaluator';
import { ExpressionType } from './expressionType';
import { Extensions } from './extensions';

/**
 * Verify the result of an expression is of the appropriate type and return a string if not.
 * @param value Value to verify.
 * @param expression Expression that produced value.
 */
export type VerifyExpression = (value: any, expression: Expression) => string;

/**
 *  <summary>
 *  Definition of default built-in functions for expressions.
 *  </summary>
 *  <remarks>
 *  These functions are largely from WDL https://docs.microsoft.com/en-us/azure/logic-apps/workflow-definition-language-functions-reference
 *  with a few extensions like infix operators for math, logic and comparisons.
 *  </remarks>
 */
export class BuiltInFunctions {
    public static readonly DefaultDateTimeFormat: string = 'YYYY-MM-DDTHH:mm:ss.0000000[Z]';
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
     * @param optional
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
            if (child.ReturnType !== type) {
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
    public static VerifyNumber(value: any, expression: Expression): string {
        let error: string;
        if (typeof value !== 'number' || Number.isNaN(value)) {
            error = `${expression} is not a number.`;
        }

        return error;
    }

    /**
     * Verify value is an integer.
     * @param value alue to check.
     * @param expression Expression that led to value.
     * @returns Error or undefined if invalid.
     */
    public static VerifyInteger(value: any, expression: Expression): string {
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
    public static VerifyString(value: any, expression: Expression): string {
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
    public static VerifyNumberOrString(value: any, expression: Expression): string {
        let error: string;
        if (value !== undefined && !(typeof value === 'number' && !Number.isNaN(value)) && typeof value !== 'string') {
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
    public static VerifyBoolean(value: any, expression: Expression): string {
        let error: string;
        if (typeof value !== 'boolean') {
            error = `${expression} is not a boolean.`;
        }

        return error;
    }

    /**
     * Verify two variables are comparable or not.
     * @param args0 first variable to check.
     * @param args1 second variable to check.
     * @returns void.
     */
    public static VerifyComparable(args0: any, args1: any): void {
        if (typeof args0 !== typeof args1) {
            throw new Error(`${args0} of type ${typeof args0} is not comparable with ${args1} of type ${typeof args1}.`);
        }
    }

    /**
     * Verify a timestamp string is valid timestamp format.
     * @param value timestamp string to check.
     * @returns void.
     */
    public static VerifyTimestamp(value: any): void {
        if (Number.isNaN((new Date(value)).getTime())) {
            throw new Error(`parameter ${value} is not valid timestamp format.`);
        }
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
        for (const child of expression.Children) {
            ({ value, error } = child.tryEvaluate(state));
            if (error !== undefined) {
                break;
            }
            if (verify !== undefined) {
                error = verify(value, child);
            }
            if (error !== undefined) {
                break;
            }
            args.push(value);
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
    public static MultivariateNumeric(type: string, func: (arg0: ReadonlyArray<any>) => any): ExpressionEvaluator {
        return new ExpressionEvaluator(type, BuiltInFunctions.ApplySequence(func, BuiltInFunctions.VerifyNumber),
                                       ReturnType.Number, BuiltInFunctions.ValidateTwoOrMoreThanTwoNumbers);
    }

    /**
     * Transform a datetime into another datetime.
     * @param timestamp Timestamp as string.
     * @param interval Seconds,minutes,hours or days. 'ss','mm','hh','d'
     * @param format How the format should looks like.
     * @returns String of transformed outcome.
     */
    public static TimeTransform(timestamp: string, numOfTransformation: any, interval: string, format: string = 'YYYY-MM-DDTHH:mm:ss.0000000[Z]'): string {
        BuiltInFunctions.VerifyTimestamp(timestamp);

        return moment(timestamp).utc().add(numOfTransformation, interval).format(BuiltInFunctions.TimestampFormatter(format));
    }

    /**
     * Comparison operators.
     * @param type Expression type.
     * @param func Function to apply.
     * @description A comparison operator returns false if the comparison is false, or there is an error.  This prevents errors from short-circuiting boolean expressions.
     */
    public static Comparison(type: string, func: (arg0: ReadonlyArray<any>) => boolean , validator: ValidateExpressionDelegate, verify?: VerifyExpression): ExpressionEvaluator {
        return new ExpressionEvaluator(type,
                                       (expression: Expression, state: any): { value: any; error: string } => {
                let result: boolean = false;
                let error: string;
                let args: ReadonlyArray<any>;
                ({ args, error } = BuiltInFunctions.EvaluateChildren(expression, state, verify));
                if (error === undefined) {
                    try {
                        result = func(args);
                    } catch (e) {
                        error = e.message;
                    }
                } else {
                    error = undefined;
                }

                return { value: result, error };
            },                         ReturnType.Boolean, validator);
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
     * Lookup a built-in function information by type.
     * @param type Type to look up.
     */
    public static Lookup(type: string): ExpressionEvaluator {
        const evaluator: ExpressionEvaluator = BuiltInFunctions._functions.get(type);
        if (evaluator === undefined) {
            throw new Error(`${type} does not have a built-in expression evaluator.`);
        }

        return evaluator;
    }

    public static TimestampFormatter(formatter: string): string {
        return formatter.replace(/dd/g, 'DD').replace(/yyyy/g, 'YYYY').replace(/d/g, 'D').replace(/y/g, 'Y');
    }

    public static TimeUnitTransformer(duration: number , cSharpStr: string): {duration: number; tsStr: string} {
        switch (cSharpStr) {
            case 'Day': return {duration, tsStr: 'days'};
            case 'Week': return {duration : duration * 7, tsStr: 'days'};
            case 'Second': return {duration, tsStr: 'seconds'};
            case 'Minute': return {duration, tsStr: 'minutes'};
            case 'Hour': return {duration, tsStr: 'hours'};
            case 'Month': return {duration, tsStr: 'months'};
            case 'Year': return {duration, tsStr: 'years'};
            default : return {duration, tsStr: 'seconds'};
        }
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

    private static Property(expression: Expression, state: any): { value: any; error: string } {
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
                    ({value, error} = Extensions.AccessIndex(inst, Number(idxValue)));
                } else if (typeof idxValue === 'string') {
                    ({value, error} = Extensions.AccessProperty(inst, idxValue.toString()));
                } else {
                    error = `Could not coerce ${index} to an int or string.`;
                }

                return {value, error};
            }

        }
    }

    private static Foreach(expression: Expression, state: any): { value: any; error: string } {
        let result: any[];
        let error: string;
        let collection: any;

        ({value: collection, error} = expression.Children[0].tryEvaluate(state));

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

                    const {value: r, error: e} = expression.Children[2].tryEvaluate(newScope);
                    if (e !== undefined) {
                        return {value: undefined, error: e};
                    }
                    result.push(r);
                }
            }
        }

        return {value: result, error};
    }

    private static ValidateForeach(expression: Expression): void {
        if (expression.Children.length !== 3) {
            throw new Error(`foreach expect 3 parameters, acutal ${expression.Children.length}`);
        }

        const second: Expression = expression.Children[1];
        if (!(second.Type === ExpressionType.Accessor && second.Children.length === 1)) {
            throw new Error(`Second paramter of foreach is not an identifier : ${second}`);
        }

        const iteratorName: string  = second.toString();

        // rewrite the 2nd, 3rd paramater
        expression.Children[1] = BuiltInFunctions.RewriteAccessor(expression.Children[1], iteratorName);
        expression.Children[2] = BuiltInFunctions.RewriteAccessor(expression.Children[2], iteratorName);
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

                expression.Children = [expression.Children[0],
                Expression.MakeExpression(ExpressionType.Accessor, undefined, new Constant(prefix))];

            }

            return expression;
        } else {
            // rewite children if have any
            for (let idx: number = 0; idx < expression.Children.length; idx ++) {
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
            result =  instance === '';
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
        ({value: str, error} = expression.Children[0].tryEvaluate(state));

        if (error === undefined) {
            if (typeof str === 'string') {
                let start: number;

                const startExpr: Expression = expression.Children[1];
                ({value: start, error} = startExpr.tryEvaluate(state));
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
                        ({value: length, error} = lengthExpr.tryEvaluate(state));
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

        return {value: result, error};
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
                (args: ReadonlyArray<any>) => {
                    if (Number(args[1]) === 0) {
                        throw new Error(`Cannot divide by 0.`);
                    }

                    return Math.floor(Number(args[0]) / Number(args[1]));
                }),
            BuiltInFunctions.Numeric(ExpressionType.Min, (args: ReadonlyArray<any>) => Math.min(args[0], args[1])),
            BuiltInFunctions.Numeric(ExpressionType.Max, (args: ReadonlyArray<any>) => Math.max(args[0], args[1])),
            BuiltInFunctions.MultivariateNumeric(ExpressionType.Power, (args: ReadonlyArray<any>) => Math.pow(args[0], args[1])),
            new ExpressionEvaluator(
                ExpressionType.Mod,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    if (Number(args[1]) === 0) {
                        throw new Error(`Cannot mod by 0.`);
                    }

                    return args[0] % args[1];
                },                     BuiltInFunctions.VerifyInteger),
                ReturnType.Number,
                BuiltInFunctions.ValidateBinaryNumber),
            new ExpressionEvaluator(
                ExpressionType.Average,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => (args[0].reduce((x: number, y: number) => x + y)) / args[0].length, BuiltInFunctions.VerifyList),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Sum,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].reduce((x: number, y: number) =>  x + y), BuiltInFunctions.VerifyList),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Count,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    if (typeof args[0] === 'string' || args[0] instanceof Array) {
                        return args[0].length;
                    }

                    if (args[0] instanceof Map) {
                        return args[0].size;
                    }

                    throw new Error(`Parameter ${args[0]} is not String, Array or Map.`);
                }),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnary),
            BuiltInFunctions.Comparison(
                ExpressionType.LessThan,
                (args: ReadonlyArray<any>) => {
                    BuiltInFunctions.VerifyComparable(args[0], args[1]);

                    return args[0] < args[1];
                }, BuiltInFunctions.ValidateBinaryNumberOrString, BuiltInFunctions.VerifyNumberOrString),
            BuiltInFunctions.Comparison(
                ExpressionType.LessThanOrEqual,
                (args: ReadonlyArray<any>) => {
                    BuiltInFunctions.VerifyComparable(args[0], args[1]);

                    return args[0] <= args[1];
                }, BuiltInFunctions.ValidateBinaryNumberOrString, BuiltInFunctions.VerifyNumberOrString),
            BuiltInFunctions.Comparison(
                ExpressionType.Equal,
                (args: ReadonlyArray<any>) => args[0] === args[1] ,
                BuiltInFunctions.ValidateBinary),
            BuiltInFunctions.Comparison(
                ExpressionType.NotEqual,
                (args: ReadonlyArray<any>) => args[0] !== args[1] ,
                BuiltInFunctions.ValidateBinary),
            BuiltInFunctions.Comparison(
                ExpressionType.GreaterThan,
                (args: ReadonlyArray<any>) => {
                    BuiltInFunctions.VerifyComparable(args[0], args[1]);

                    return args[0] > args[1];
                }, BuiltInFunctions.ValidateBinaryNumberOrString, BuiltInFunctions.VerifyNumberOrString),
            BuiltInFunctions.Comparison(
                ExpressionType.GreaterThanOrEqual,
                (args: ReadonlyArray<any>) => {
                    BuiltInFunctions.VerifyComparable(args[0], args[1]);

                    return args[0] >= args[1];
                }, BuiltInFunctions.ValidateBinaryNumberOrString, BuiltInFunctions.VerifyNumberOrString),
            BuiltInFunctions.Comparison(
                ExpressionType.Exists,
                (args: ReadonlyArray<any>) => args[0] !== undefined,
                BuiltInFunctions.ValidateUnary, BuiltInFunctions.VerifyNumberOrString),
            new ExpressionEvaluator(
                ExpressionType.And,
                (expression: Expression, state: any): { value: any; error: string }  => BuiltInFunctions.And(expression, state),
                ReturnType.Boolean, BuiltInFunctions.ValidateAtLeastOne),
            new ExpressionEvaluator(
                ExpressionType.Or,
                (expression: Expression, state: any): { value: any; error: string }  => BuiltInFunctions.Or(expression, state),
                ReturnType.Boolean, BuiltInFunctions.ValidateAtLeastOne),
            new ExpressionEvaluator(
                ExpressionType.Not,
                (expression: Expression, state: any): { value: any; error: string }  => BuiltInFunctions.Not(expression, state),
                ReturnType.Boolean,
                BuiltInFunctions.ValidateUnary),
            BuiltInFunctions.Comparison(
                ExpressionType.Contains,
                (args: ReadonlyArray<any>) => {
                    if (typeof args[0] === 'string' || args[0] instanceof Array) {
                        return args[0].includes(args[1]);
                    } else if (args[0] instanceof Map) {
                        return <Map<string, any>>args[0].get(args[1]) !== undefined;
                    } else {
                        return (args[1] in args[0]);
                    }
                },
                BuiltInFunctions.ValidateBinary),
            BuiltInFunctions.Comparison(
                ExpressionType.Empty,
                (args: ReadonlyArray<any>) => this.IsEmpty(args[0]),
                BuiltInFunctions.ValidateUnary, BuiltInFunctions.VerifyNumberOrString),
            new ExpressionEvaluator(
                ExpressionType.Concat,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => ''.concat(...args), BuiltInFunctions.VerifyString),
                ReturnType.String,
                BuiltInFunctions.ValidateString),
            new ExpressionEvaluator(
                ExpressionType.Length,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].length, BuiltInFunctions.VerifyString),
                ReturnType.Number),
            new ExpressionEvaluator(
                ExpressionType.Replace,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].replace(new RegExp(args[1], 'g'), args[2]), BuiltInFunctions.VerifyString),
                ReturnType.String,
                (expression: Expression): void  => BuiltInFunctions.ValidateArityAndAnyType(expression, 3, 3, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.ReplaceIgnoreCase,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].replace(new RegExp(args[1], 'gi'), args[2]), BuiltInFunctions.VerifyString),
                ReturnType.String,
                (expression: Expression): void  => BuiltInFunctions.ValidateArityAndAnyType(expression, 3, 3, ReturnType.String)),
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
                ExpressionType.Join,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    if (args[0] instanceof Array && typeof args[1] === 'string') {
                        return args[0].join(args[1]);
                    }

                    throw new Error();
                }),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.Object, ReturnType.String)),
            // datetime
            new ExpressionEvaluator(
                ExpressionType.AddDays,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    const format: string = args.length === 3 ? args[2] : BuiltInFunctions.DefaultDateTimeFormat;

                    return this.TimeTransform(args[0], args[1], 'd', format);
                }),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, [ReturnType.String], ReturnType.String, ReturnType.Number)),
            new ExpressionEvaluator(
                ExpressionType.AddHours,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    const format: string = args.length === 3 ? args[2] : BuiltInFunctions.DefaultDateTimeFormat;

                    return this.TimeTransform(args[0], args[1], 'h', format);
                }),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, [ReturnType.String], ReturnType.String, ReturnType.Number)),
            new ExpressionEvaluator(
                ExpressionType.AddMinutes,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    const format: string = args.length === 3 ? args[2] : BuiltInFunctions.DefaultDateTimeFormat;

                    return this.TimeTransform(args[0], args[1], 'minutes', format);
                }),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, [ReturnType.String], ReturnType.String, ReturnType.Number)),
            new ExpressionEvaluator(
                ExpressionType.AddSeconds,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    const format: string = args.length === 3 ? args[2] : BuiltInFunctions.DefaultDateTimeFormat;

                    return this.TimeTransform(args[0], args[1], 'seconds', format);
                }),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, [ReturnType.String], ReturnType.String, ReturnType.Number)),
            new ExpressionEvaluator(
                ExpressionType.DayOfMonth,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    BuiltInFunctions.VerifyTimestamp(args[0]);

                    return (moment(args[0]).date());
                },                     BuiltInFunctions.VerifyString),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.DayOfWeek,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    BuiltInFunctions.VerifyTimestamp(args[0]);

                    return (moment(args[0]).days());
                },                     BuiltInFunctions.VerifyString),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.DayOfYear,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    BuiltInFunctions.VerifyTimestamp(args[0]);

                    return (moment(args[0]).dayOfYear());
                },                     BuiltInFunctions.VerifyString),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.Month,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    BuiltInFunctions.VerifyTimestamp(args[0]);

                    return moment(args[0]).month() + 1;
                },                     BuiltInFunctions.VerifyString),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.Date,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    BuiltInFunctions.VerifyTimestamp(args[0]);

                    return moment(args[0]).utc().format('M/DD/YYYY');
                },                     BuiltInFunctions.VerifyString),
                ReturnType.String,
                BuiltInFunctions.ValidateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.Year,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    BuiltInFunctions.VerifyTimestamp(args[0]);

                    return moment(args[0]).year();
                },                     BuiltInFunctions.VerifyString),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnaryString),
            new ExpressionEvaluator(ExpressionType.UtcNow, BuiltInFunctions.Apply(
                (args: ReadonlyArray<any>) => {
                    return moment().utc().format((args.length === 1 ? args[0] : BuiltInFunctions.DefaultDateTimeFormat));
                }, BuiltInFunctions.VerifyString),
                                    ReturnType.String),
            new ExpressionEvaluator(
                ExpressionType.FormatDateTime,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    BuiltInFunctions.VerifyTimestamp(args[0]);

                    return moment(args[0]).utc().format((args.length === 2 ? BuiltInFunctions.TimestampFormatter(args[1]) : BuiltInFunctions.DefaultDateTimeFormat));
                },                     BuiltInFunctions.VerifyString),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, [ReturnType.String], ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.SubtractFromTime,
                (expr: Expression, state: any): {value: any; error: string} => {
                    let value: any;
                    let error: any;
                    let args: ReadonlyArray<any>;
                    ({args, error} = BuiltInFunctions.EvaluateChildren(expr, state));
                    BuiltInFunctions.VerifyTimestamp(args[0]);

                    if (error === undefined) {
                        if (typeof args[0] === 'string' && Number.isInteger(args[1]) && typeof args[2] === 'string') {
                            const format: string = (args.length === 4 ? BuiltInFunctions.TimestampFormatter(args[3]) : BuiltInFunctions.DefaultDateTimeFormat);
                            const {duration, tsStr} = BuiltInFunctions.TimeUnitTransformer(args[1], args[2]);
                            const dur: any = duration;

                            value = moment(args[0]).utc().subtract(dur, tsStr).format(format);
                        } else {
                            error = `${expr} can't evaluate.`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, [ReturnType.String], ReturnType.String, ReturnType.Number, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.DateReadBack,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    let value: any;
                    const dateFormat: string = 'YYYY-MM-DD';
                    BuiltInFunctions.VerifyTimestamp(args[0]);
                    BuiltInFunctions.VerifyTimestamp(args[1]);

                    if (moment(args[0]).format(dateFormat) === moment(args[1]).format(dateFormat)) {
                        value = 'Today';
                    } else if (moment(args[0]).format(dateFormat) === moment(args[1]).subtract(1, 'day').format(dateFormat)) {
                        value = 'Tomorrow';
                    } else if (moment(args[0]).format(dateFormat) === moment(args[1]).subtract(2, 'day').format(dateFormat)) {
                        value = 'The day after tomorrow';
                    } else if (moment(args[1]).format(dateFormat) === moment(args[0]).subtract(1, 'day').format(dateFormat)) {
                        value = 'Yesterday';
                    } else if (moment(args[1]).format(dateFormat) === moment(args[0]).subtract(2, 'day').format(dateFormat)) {
                        value = 'The day before yesterday';
                    }

                    return value;
                },                     this.VerifyString),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.String, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.GetTimeOfDay,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    let value: any;
                    BuiltInFunctions.VerifyTimestamp(args[0]);

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

                    return value;
                },                     this.VerifyString),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.String)),
            new ExpressionEvaluator(ExpressionType.Float, BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                const parsedValue: number = parseFloat(args[0]);
                if (parsedValue === undefined || Number.isNaN(parsedValue)) {
                    throw new Error(`parameter ${args[0]} is not a valid number string.`);
                }

                return parsedValue;
            }),                     ReturnType.Number, BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Int,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    const parsedValue: number = parseInt(args[0], 10);
                    if (parsedValue === undefined || Number.isNaN(parsedValue)) {
                        throw new Error(`parameter ${args[0]} is not a valid number string.`);
                    }

                    return parsedValue;
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
                ExpressionType.Property,
                BuiltInFunctions.Property,
                ReturnType.Object,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.Object, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.If,
                (expression: Expression, state: any): { value: any; error: string }  => BuiltInFunctions.If(expression, state),
                ReturnType.Object,
                (expr: Expression): void => BuiltInFunctions.ValidateArityAndAnyType(expr, 3, 3)),
            new ExpressionEvaluator(
                ExpressionType.Rand,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    if (args[0] > args[1]) {
                        throw new Error(`Min value ${args[0]} cannot be greater than max value ${args[1]}.`);
                    }

                    return Math.floor(Math.random() * (Number(args[1]) - Number(args[0])) + Number(args[0]));
                },                     BuiltInFunctions.VerifyInteger),
                ReturnType.Number,
                BuiltInFunctions.ValidateBinaryNumber),
            new ExpressionEvaluator(ExpressionType.CreateArray, BuiltInFunctions.Apply((args: ReadonlyArray<any>) => Array.from(args)), ReturnType.Object),
            new ExpressionEvaluator(
                ExpressionType.First, BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    if (typeof args[0] === 'string' && args[0].length > 0) { return args[0][0]; }
                    if (args[0] instanceof Array && args[0].length > 0) { return Extensions.AccessIndex(args[0], 0).value; }

                    return undefined;
                }),
                ReturnType.Object,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Last,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    if (typeof args[0] === 'string' && args[0].length > 0) { return args[0][args[0].length - 1]; }
                    if (args[0] instanceof Array && args[0].length > 0) { return Extensions.AccessIndex(args[0], args[0].length - 1).value; }

                    return undefined;
                }),
                ReturnType.Object,
                BuiltInFunctions.ValidateUnary),
            new ExpressionEvaluator(
                ExpressionType.Json,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    if (typeof args[0] !== 'string') {
                        throw new Error(`parameter ${args[0]} is not string type.`);
                    }

                    return JSON.parse(args[0]);
                }),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.AddProperty,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    const temp: any = args[0];
                    temp[String(args[1])] = args[2];

                    return temp;
                }),
                ReturnType.Object,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.Object, ReturnType.String, ReturnType.Object)),
            new ExpressionEvaluator(
                ExpressionType.SetProperty,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    const temp: any = args[0];
                    temp[String(args[1])] = args[2];

                    return temp;
                }),
                ReturnType.Object,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.Object, ReturnType.String, ReturnType.Object)),
            new ExpressionEvaluator(
                ExpressionType.RemoveProperty,
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    const temp: any = args[0];
                    delete temp[String(args[1])];

                    return temp;
                }),
                ReturnType.Object,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.Object, ReturnType.String)),
            new ExpressionEvaluator(ExpressionType.Foreach, BuiltInFunctions.Foreach, ReturnType.Object, BuiltInFunctions.ValidateForeach)
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
