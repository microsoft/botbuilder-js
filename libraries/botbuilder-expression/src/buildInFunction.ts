
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
import { EvaluateExpressionDelegate, ExpressionEvaluator } from './expressionEvaluator';
import { ExpressionType } from './expressionType';
import { Extensions } from './extensions';

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
     * Validate 1 or more numeric arguments.
     * @param expression Expression to validate.
     */
    public static ValidateNumber(expression: Expression): void {

        BuiltInFunctions.ValidateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.Number);
    }

    /**
     * Validate 1 or more boolean arguments.
     * @param expression Expression to validate.
     */
    public static ValidateBoolean(expression: Expression): void {
        BuiltInFunctions.ValidateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.Boolean);
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
        if (Number.isNaN(value)) {
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
        if (value !== undefined && Number.isNaN(value) && typeof value !== 'string') {
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
     * Evaluate expression children and return them.
     * @param expression Expression with children.
     * @param state Global state.
     * @param verify Optional function to verify each child's result.
     * @returns List of child values or error message.
     */
    public static EvaluateChildren(expression: Expression, state: any, verify?: (arg0: any, arg1: Expression) => any)
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
    public static Apply(func: (arg0: ReadonlyArray<any>) => any, verify?: (arg0: any, arg1: Expression) => string)
        : EvaluateExpressionDelegate {
        return (expression: Expression, state: any): { value: any; error: string } => {
            let value: any;
            let error: string;
            let args: ReadonlyArray<any>;
            ({ args, error } = BuiltInFunctions.EvaluateChildren(expression, state, verify));
            if (error === undefined) {
                value = func(args);
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
    public static ApplySequence(func: (arg0: ReadonlyArray<any>) => any, verify?: (arg0: any, arg1: Expression) => string)
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
     * @param func Function to apply.
     */
    public static Numeric(func: (arg0: ReadonlyArray<any>) => any): ExpressionEvaluator {
        return new ExpressionEvaluator(BuiltInFunctions.ApplySequence(func, BuiltInFunctions.VerifyNumber),
                                       ReturnType.Number, BuiltInFunctions.ValidateNumber);
    }

    /**
     * Transform a datetime into another datetime.
     * @param timestamp Timestamp as string.
     * @param interval Seconds,minutes,hours or days. 'ss','mm','hh','d'
     * @param format How the format should looks like.
     * @returns String of transformed outcome.
     */
    public static TimeTransform(timestamp: string, numOfTransformation: any, interval: string, format: string = 'YYYY-MM-DDTHH:mm:ss.0000000[Z]'): string {
        return moment(timestamp).utc().add(numOfTransformation, interval).format(BuiltInFunctions.TimestampFormatter(format));
    }

    /**
     * Comparison operators that have 2 args and work over strings or numbers.
     * @param func Function to apply.
     */
    public static Comparison(func: (arg0: ReadonlyArray<any>) => any): ExpressionEvaluator {
        return new ExpressionEvaluator(BuiltInFunctions.Apply(func, BuiltInFunctions.VerifyNumberOrString),
                                       ReturnType.Boolean, BuiltInFunctions.ValidateBinaryNumberOrString);
    }

    /**
     * Transform a string into another string.
     * @param func Function to apply.
     */
    public static StringTransform(func: (arg0: ReadonlyArray<any>) => any): ExpressionEvaluator {
        return new ExpressionEvaluator(BuiltInFunctions.Apply(func, BuiltInFunctions.VerifyString),
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
        let instance: any = state;
        const children: Expression[] = expression.Children;
        if (children.length === 2) {
            ({ value: instance, error } = children[1].tryEvaluate(state));
        } else {
            instance = state;
        }

        if (error === undefined && children[0] instanceof Constant && (<Constant>children[0]).ReturnType === ReturnType.String) {
            ({ value, error } = Extensions.AccessProperty(instance, (<Constant>children[0]).Value.toString(), expression));
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
                    const idx: number = Number(idxValue);
                    let count: number = -1;
                    if (inst instanceof Array) {
                        count = (inst).length;
                    } else if (inst instanceof Map) {
                        count = (<Map<string, any>>inst).size;
                    }
                    const indexer: string[] = Object.keys(inst);
                    if (count !== -1 && indexer.length > 0) {
                        if (idx >= 0 && count > idx) {
                            const idyn: any = inst;
                            value = idyn[idx];
                        } else {
                            error = `${index}=${idx} is out of range for ${instance}`;
                        }
                    } else {
                        error = `${instance} is not a collection.`;
                    }
                } else {
                    error = `Could not coerce ${index} to an int.`;
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

    private static And(expression: Expression, state: any): { value: any; error: string } {
        let result: boolean = true;
        let error: string;
        for (const child of expression.Children) {
            ({ value: result, error } = child.tryEvaluate(state));
            if (error === undefined) {
                if (!(typeof result === 'boolean')) {
                    error = `${child} is not boolean`;
                    break;
                } else {
                    const boolResult: boolean = result;
                    if (!boolResult) {
                        //Hit a false to break
                        break;
                    }
                }
            } else {
                break;
            }
        }

        return { value: result, error };
    }

    private static Or(expression: Expression, state: any): { value: any; error: string } {
        let result: boolean = true;
        let error: string;
        for (const child of expression.Children) {
            ({ value: result, error } = child.tryEvaluate(state));
            if (error === undefined) {
                if (!(typeof result === 'boolean')) {
                    error = `${child} is not boolean`;
                    break;
                } else {
                    const boolResult: boolean = result;
                    if (boolResult) {
                        //Hit a true to break
                        break;
                    }
                }
            } else {
                break;
            }
        }

        return { value: result, error };
    }

    private static Substring(expression: Expression, state: any): { value: any; error: string } {
        let result: any;
        let error: any;
        let str: string;
        let start: number;
        let length: number;
        ({value: str, error} = expression.Children[0].tryEvaluate(state));
        if (error === undefined) {
            const startExpr: Expression = expression.Children[1];
            ({value: start, error} = startExpr.tryEvaluate(state));
            if (error === undefined && !Number.isInteger(start)) {
                error = `${startExpr} is not an integer.`;
            } else if (start < 0 || start >= str.length) {
                error = `${startExpr}=${start} which is out of range for ${str}`;
            }
            if (error === undefined) {
                const lengthExpr: Expression = expression.Children[2];
                ({value: length, error} = lengthExpr.tryEvaluate(state));
                if (error === undefined && !Number.isInteger(length)) {
                    error = `${lengthExpr} is not an integer`;
                } else if (length < 0 || Number(start) + Number(length) > str.length) {
                    error = `${lengthExpr}=${length} which is out of range for ${str}`;
                }
                if (error === undefined) {
                    result = str.substr(start, length);
                }
            }
        }

        return {value: result, error};
    }

// tslint:disable-next-line: max-func-body-length
    private static BuildFunctionLookup(): Map<string, ExpressionEvaluator> {
        // tslint:disable-next-line: no-unnecessary-local-variable
        const functions: Map<string, ExpressionEvaluator> = new Map<string, ExpressionEvaluator>([
            //Math
            [ExpressionType.Element, new ExpressionEvaluator(BuiltInFunctions.ExtractElement, ReturnType.Object,
                                                             (expr: Expression): void =>
                                                             BuiltInFunctions.ValidateOrder(expr, undefined, ReturnType.Object, ReturnType.Number))],
            [ExpressionType.Add, BuiltInFunctions.Numeric((args: ReadonlyArray<any>) => Number(args[0]) + Number(args[1]))],
            [ExpressionType.Subtract, BuiltInFunctions.Numeric((args: ReadonlyArray<any>)  => args[0] - args[1])],

            [ExpressionType.Multiply, BuiltInFunctions.Numeric((args: ReadonlyArray<any>) => args[0] * args[1])],
            [ExpressionType.Divide, new ExpressionEvaluator(BuiltInFunctions.ApplySequence((args: ReadonlyArray<any>) => Math.floor(args[0] / args[1]),
                                                                                           (value: any, expression: Expression) => {
                    let error: string = BuiltInFunctions.VerifyNumber(value, expression);
                    if (error === undefined && value === 0) {
                        error = `Cannot divide by 0 from ${expression}`;
                    }

                    return error;
                }),                                         ReturnType.Number, BuiltInFunctions.ValidateNumber)],
            [ExpressionType.Min, BuiltInFunctions.Numeric((args: ReadonlyArray<any>) => Math.min(args[0], args[1]))],
            [ExpressionType.Max, BuiltInFunctions.Numeric((args: ReadonlyArray<any>) => Math.max(args[0], args[1]))],
            [ExpressionType.Power, BuiltInFunctions.Numeric((args: ReadonlyArray<any>) => Math.pow(args[0], args[1]))],
            [ExpressionType.Mod, new ExpressionEvaluator(BuiltInFunctions.Apply(
                (args: ReadonlyArray<any>) => args[0] % args[1], BuiltInFunctions.VerifyInteger),
                     ReturnType.Number, BuiltInFunctions.ValidateBinaryNumber)],
            [ExpressionType.Average, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => (args[0].reduce((x: number, y: number) => x + y)) / args[0].length, BuiltInFunctions.VerifyList),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnary)],
            [ExpressionType.Sum, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].reduce((x: number, y: number) => x + y), BuiltInFunctions.VerifyList),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnary)],
            [ExpressionType.Count, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].length, BuiltInFunctions.VerifyList),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnary)],
            [ExpressionType.LessThan, BuiltInFunctions.Comparison((args: ReadonlyArray<any>) => args[0] < args[1])],
            [ExpressionType.LessThanOrEqual, BuiltInFunctions.Comparison((args: ReadonlyArray<any>) => args[0] <= args[1])],
            [ExpressionType.Equal, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0] === args[1]), ReturnType.Boolean, BuiltInFunctions.ValidateBinary)],
            [ExpressionType.NotEqual, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0] !== args[1]), ReturnType.Boolean, BuiltInFunctions.ValidateBinary)],
            [ExpressionType.GreaterThan, BuiltInFunctions.Comparison((args: ReadonlyArray<any>) => args[0] > args[1]) ],
            [ExpressionType.GreaterThanOrEqual, BuiltInFunctions.Comparison((args: ReadonlyArray<any>) => args[0] >= args[1])],
            [ExpressionType.Exists, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0] !== undefined && args[0] !== undefined),
                                                            ReturnType.Boolean, BuiltInFunctions.ValidateUnary)],
            [ExpressionType.And, new ExpressionEvaluator((expression: Expression, state: any): { value: any; error: string }  => BuiltInFunctions.And(expression, state),
                                                         ReturnType.Boolean, BuiltInFunctions.ValidateBoolean)],
            [ExpressionType.Or, new ExpressionEvaluator((expression: Expression, state: any): { value: any; error: string }  => BuiltInFunctions.Or(expression, state),
                                                        ReturnType.Boolean, BuiltInFunctions.ValidateBoolean)],
            [ExpressionType.Not, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => !args[0], BuiltInFunctions.VerifyBoolean),
                                                         ReturnType.Boolean, BuiltInFunctions.ValidateUnaryBoolean)],
            [ExpressionType.Contains, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    if (typeof args[0] === 'string' || args[0] instanceof Array) {
                        return args[0].includes(args[1]);
                    } else if (args[0] instanceof Map) {
                        return <Map<string, any>>args[0].get(args[1]) !== undefined;
                    } else {
                        return (args[1] in args[0]);
                    }
                }),
                ReturnType.Boolean,
                BuiltInFunctions.ValidateBinary)],
            [ExpressionType.Empty, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                if (args[0] === undefined) { return true; }
                if (typeof args[0] === 'string') { return args[0] === ''; }
                if (args[0] instanceof Array) { return args[0].length === 0; }

                return Object.keys(args[0]).length === 0;
         }),                                               ReturnType.Boolean, BuiltInFunctions.ValidateUnary)],
            [ExpressionType.Concat, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => ''.concat(...args), BuiltInFunctions.VerifyString),
                ReturnType.String, BuiltInFunctions.ValidateString) ],
            [ExpressionType.Length, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].length, BuiltInFunctions.VerifyString),
                                                            ReturnType.Number)],
            [ExpressionType.Replace, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].replace(new RegExp(args[1], 'g'), args[2]),
                                                                                    BuiltInFunctions.VerifyString),
                                                             ReturnType.String, (expression: Expression): void  =>
            BuiltInFunctions.ValidateArityAndAnyType(expression, 3, 3, ReturnType.String))],
            [ExpressionType.ReplaceIgnoreCase, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].replace(new RegExp(args[1], 'gi'), args[2]),
                                                                                              BuiltInFunctions.VerifyString),
                                                                       ReturnType.String, (expression: Expression): void  =>
                                                                                              BuiltInFunctions.ValidateArityAndAnyType(expression, 3, 3, ReturnType.String))],
            [ExpressionType.Split, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0].split(args[1]), BuiltInFunctions.VerifyString),
                ReturnType.Object, (expression: Expression): void => BuiltInFunctions.ValidateArityAndAnyType(expression, 2, 2, ReturnType.String))],
            [ExpressionType.Substring,                     new ExpressionEvaluator(
                BuiltInFunctions.Substring, ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.String, ReturnType.Number, ReturnType.Number))],
            [ExpressionType.ToLower, BuiltInFunctions.StringTransform((args: ReadonlyArray<any>) => String(args[0]).toLowerCase())],
            [ExpressionType.ToUpper, BuiltInFunctions.StringTransform((args: ReadonlyArray<any>) => String(args[0]).toUpperCase())],
            [ExpressionType.Trim, BuiltInFunctions.StringTransform((args: ReadonlyArray<any>) => String(args[0]).trim())],
            [ExpressionType.Join, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    if (args[0] instanceof Array && typeof args[1] === 'string') {
                        return args[0].join(args[1]);
                    }

                    throw new Error();
                }),
                ReturnType.String,
                BuiltInFunctions.ValidateBinary)],

            // datetime
            [ExpressionType.AddDays, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    const format: string = args.length === 3 ? args[2] : BuiltInFunctions.DefaultDateTimeFormat;

                    return this.TimeTransform(args[0], args[1], 'd', format);
                }),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateArityAndAnyType(expression, 2, 3))],
            [ExpressionType.AddHours, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    const format: string = args.length === 3 ? args[2] : BuiltInFunctions.DefaultDateTimeFormat;

                    return this.TimeTransform(args[0], args[1], 'h', format);
                }),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateArityAndAnyType(expression, 2, 3))],
            [ExpressionType.AddMinutes, new ExpressionEvaluator(
                 BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    const format: string = args.length === 3 ? args[2] : BuiltInFunctions.DefaultDateTimeFormat;

                    return this.TimeTransform(args[0], args[1], 'minutes', format);
                }),
                 ReturnType.String,
                 (expression: Expression): void => BuiltInFunctions.ValidateArityAndAnyType(expression, 2, 3))],
            [ExpressionType.AddSeconds,  new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    const format: string = args.length === 3 ? args[2] : BuiltInFunctions.DefaultDateTimeFormat;

                    return this.TimeTransform(args[0], args[1], 'seconds', format);
                }),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateArityAndAnyType(expression, 2, 3))],
            [ExpressionType.DayOfMonth,  new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    return (moment(args[0]).date());
                },                     BuiltInFunctions.VerifyString),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnaryString)],
            [ExpressionType.DayOfWeek, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    return (moment(args[0]).days());
                },                     BuiltInFunctions.VerifyString),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnaryString)],
            [ExpressionType.DayOfYear, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    return (moment(args[0]).dayOfYear());
                },                     BuiltInFunctions.VerifyString),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnaryString)],
            [ExpressionType.Month, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => moment(args[0]).month() + 1, BuiltInFunctions.VerifyString),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnaryString)],
            [ExpressionType.Date, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => moment(args[0]).utc().format('M/DD/YYYY'), BuiltInFunctions.VerifyString),
                ReturnType.String,
                BuiltInFunctions.ValidateUnaryString)],
            [ExpressionType.Year, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => moment(args[0]).year(), BuiltInFunctions.VerifyString),
                ReturnType.Number,
                BuiltInFunctions.ValidateUnaryString)],
            [ExpressionType.UtcNow, new ExpressionEvaluator(BuiltInFunctions.Apply(
                (args: ReadonlyArray<any>) => moment().utc().format((args.length === 1 ? args[0] : BuiltInFunctions.DefaultDateTimeFormat)), BuiltInFunctions.VerifyString),
                                                            ReturnType.String)],
            [ExpressionType.FormatDateTime, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => moment(args[0]).utc()
                .format((args.length === 2 ? BuiltInFunctions.TimestampFormatter(args[1]) : BuiltInFunctions.DefaultDateTimeFormat)),
                                       BuiltInFunctions.VerifyString),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, [ReturnType.String], ReturnType.String))],
            [ExpressionType.SubtractFromTime, new ExpressionEvaluator(
                (expr: Expression, state: any): {value: any; error: string} => {
                    let value: any;
                    let error: any;
                    let args: ReadonlyArray<any>;
                    ({args, error} = BuiltInFunctions.EvaluateChildren(expr, state));

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
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, [ReturnType.String], ReturnType.String, ReturnType.Number, ReturnType.String))],
            [ExpressionType.DateReadBack, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                        let value: any;
                        const dateFormat: string = 'YYYY-MM-DD';

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
                    },                 this.VerifyString),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.String, ReturnType.String))],
            [ExpressionType.GetTimeOfDay, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                        let value: any;
                        const thisTime: number  = moment.parseZone(args[0]).hour() * 100 + moment.parseZone(args[0]).minute();
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
                    },                 this.VerifyString),
                ReturnType.String,
                (expression: Expression): void => BuiltInFunctions.ValidateOrder(expression, undefined, ReturnType.String))],

            [ExpressionType.Float, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => parseFloat(args[0])), ReturnType.Number, BuiltInFunctions.ValidateUnary)],
            [ExpressionType.Int, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => parseInt(args[0], 10)), ReturnType.Number, BuiltInFunctions.ValidateUnary)],
            [ExpressionType.String, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => JSON.stringify(args[0]).replace(/(^\'*)/g, '')
            .replace(/(\'*$)/g, '').replace(/(^\"*)/g, '').replace(/(\"*$)/g, '')),
                                                            ReturnType.String, BuiltInFunctions.ValidateUnary) ],
            [ExpressionType.Bool, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                //parse 'true' to true, and parse 'false' to false
                if (new RegExp(/true/i).test(args[0])) { return true; }
                if (new RegExp(/false/i).test(args[0])) { return false; }

                return Boolean(args[0]);
            }),                                           ReturnType.Boolean, BuiltInFunctions.ValidateUnary)],
            [ExpressionType.Accessor, new ExpressionEvaluator(BuiltInFunctions.Accessor, ReturnType.Object, BuiltInFunctions.ValidateAccessor)],
            [ExpressionType.If, new ExpressionEvaluator(
                BuiltInFunctions.Apply((args: ReadonlyArray<any>) => args[0] ? args[1] : args[2]),
                ReturnType.Object,
                (expr: Expression): void => BuiltInFunctions.ValidateOrder(expr, undefined, ReturnType.Boolean, ReturnType.Object, ReturnType.Object))],
            // tslint:disable-next-line: insecure-random
            [ExpressionType.Rand, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => Math.floor(Math.random() * (Number(args[1]) - Number(args[0])) + Number(args[0])),
                                                                                 BuiltInFunctions.VerifyInteger),
                                                          ReturnType.Number, BuiltInFunctions.ValidateBinaryNumber)],
            [ExpressionType.CreateArray, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => Array.from(args)), ReturnType.Object)],
            [ExpressionType.First, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                    if (typeof args[0] === 'string' && args[0].length > 0) { return args[0][0]; }
                    if (args[0] instanceof Array && args[0].length > 0) { return args[0][0]; }

                    return undefined;
                }),                                        ReturnType.Object, BuiltInFunctions.ValidateUnary) ],
            [ExpressionType.Last, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {
                if (typeof args[0] === 'string' && args[0].length > 0) { return args[0][args[0].length - 1]; }
                if (args[0] instanceof Array && args[0].length > 0) { return args[0][args[0].length - 1]; }

                return undefined;
            }),                                           ReturnType.Object, BuiltInFunctions.ValidateUnary) ],
            [ExpressionType.Json, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => JSON.parse(args[0])), ReturnType.String, BuiltInFunctions.ValidateUnary)],
            // tslint:disable-next-line: newline-before-return
            [ExpressionType.AddProperty, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {const temp: any = args[0];  temp[String(args[1])] = args[2]; return temp; }))],
            // tslint:disable-next-line: newline-before-return
            [ExpressionType.SetProperty, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => {const temp: any = args[0];  temp[String(args[1])] = args[2]; return temp; }))],

                // tslint:disable-next-line: no-dynamic-delete
            [ExpressionType.RemoveProperty, new ExpressionEvaluator(BuiltInFunctions.Apply((args: ReadonlyArray<any>) => { const temp: any = args[0]; delete temp[String(args[1])];

                                                                                                                           return temp; }))],
            [ExpressionType.Foreach, new ExpressionEvaluator(BuiltInFunctions.Foreach, ReturnType.Object, BuiltInFunctions.ValidateForeach)]
        ]);

        // Math aliases

        functions.set('add', functions.get(ExpressionType.Add));
        functions.set('mul', functions.get(ExpressionType.Multiply));

        functions.set('div', functions.get(ExpressionType.Divide));
        functions.set('mul', functions.get(ExpressionType.Multiply));
        functions.set('sub', functions.get(ExpressionType.Subtract));
        functions.set('exp', functions.get(ExpressionType.Power));
        functions.set('mod', functions.get(ExpressionType.Mod));

        // Comparison aliases
        functions.set('and', functions.get(ExpressionType.And));
        functions.set('equals', functions.get(ExpressionType.Equal));
        functions.set('greater', functions.get(ExpressionType.GreaterThan));
        functions.set('greaterOrEquals', functions.get(ExpressionType.GreaterThanOrEqual));
        functions.set('less', functions.get(ExpressionType.LessThan));
        functions.set('lessOrEquals', functions.get(ExpressionType.LessThanOrEqual));
        functions.set('not', functions.get(ExpressionType.Not));
        functions.set('or', functions.get(ExpressionType.Or));
        functions.set('concat', functions.get(ExpressionType.Concat));

        return functions;
    }
}
