/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';

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

        return {value, error};
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [], ReturnType.String | ReturnType.Array, ReturnType.Object);
    }
}