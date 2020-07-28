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
=======
import { ReturnType } from '../returnType';
>>>>>>> master

/**
 * Return a string that has all the items from an array, with each character separated by a delimiter.
 */
export class Join extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
        super(ExpressionType.Join, Join.evaluator, ReturnType.String, Join.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: string;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expression, state, options));
=======
    public constructor() {
        super(ExpressionType.Join, Join.evaluator, ReturnType.String, Join.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        let error: string;
        let args: any[];
        ({ args, error } = FunctionUtils.evaluateChildren(expression, state, options));
>>>>>>> master
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

<<<<<<< HEAD
        return {value, error};
=======
        return { value, error };
>>>>>>> master
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.Array, ReturnType.String);
    }
}