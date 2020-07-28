/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

<<<<<<< HEAD
import { ExpressionEvaluator } from '../expressionEvaluator';
import { Expression } from '../expression';
import { ReturnType } from '../returnType';
=======
import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
>>>>>>> master
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
<<<<<<< HEAD

/**
 * Return the starting position or index value of the last occurrence of a substring.
 * This function is case-insensitive, and indexes start with the number 0.
 */
export class LastIndexOf extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.LastIndexOf, LastIndexOf.evaluator, ReturnType.Number, LastIndexOf.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value = -1;
        let error: string;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expression, state, options));
        if (!error) {
            if (args[0] == undefined || typeof args[0] === 'string') {
                if (args[1] === undefined || typeof args[1] === 'string') {
                    const str = FunctionUtils.parseStringOrNull(args[0]);
                    const searchValue = FunctionUtils.parseStringOrNull(args[1]);
=======
import { ReturnType } from '../returnType';

/**
 * Returns the index of the last occurrence of a specified value in an array.
 * The zero-based index position of value if that value is found, or -1 if it is not.
 */
export class LastIndexOf extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.LastIndexOf, LastIndexOf.evaluator, ReturnType.Number, LastIndexOf.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value = -1;
        let error: string;
        let args: any[];
        ({ args, error } = FunctionUtils.evaluateChildren(expression, state, options));
        if (!error) {
            if (args[0] == undefined || typeof args[0] === 'string') {
                if (args[1] === undefined || typeof args[1] === 'string') {
                    const str = FunctionUtils.parseStringOrUndefined(args[0]);
                    const searchValue = FunctionUtils.parseStringOrUndefined(args[1]);
>>>>>>> master
                    value = str.lastIndexOf(searchValue, str.length - 1);
                } else {
                    error = `Can only look for indexof string in ${expression}`;
                }
            } else if (Array.isArray(args[0])) {
                value = args[0].lastIndexOf(args[1]);
            } else {
                error = `${expression} works only on string or list.`;
            }
        }

<<<<<<< HEAD
        return {value, error};
=======
        return { value, error };
>>>>>>> master
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [], ReturnType.String | ReturnType.Array, ReturnType.Object);
    }
}