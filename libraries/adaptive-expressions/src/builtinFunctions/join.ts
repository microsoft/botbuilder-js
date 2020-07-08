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

export class Join extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Join, Join.evaluator, ReturnType.String, Join.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: string;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expression, state, options));
        if (!error) {
            if (!Array.isArray(args[0])) {
                error = `${expression.children[0]} evaluates to ${args[0]} which is not a list.`;
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

        return {value, error};
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.Array, ReturnType.String);
    }
}