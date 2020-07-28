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
 * Check whether all expressions are true. Return true if all expressions are true,
 * or return false if at least one expression is false.
 */
export class And extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.And, And.evaluator, ReturnType.Boolean, FunctionUtils.validateAtLeastOne);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
=======
import { ReturnType } from '../returnType';

/**
 * Return true if all expressions are true or return false if at least one expression is false.
 */
export class And extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.And, And.evaluator, ReturnType.Boolean, FunctionUtils.validateAtLeastOne);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
>>>>>>> master
        let result = true;
        let error: string;
        for (const child of expression.children) {
            const newOptions = new Options(options);
            newOptions.nullSubstitution = undefined;
<<<<<<< HEAD
            ({value: result, error} = child.tryEvaluate(state, newOptions));
=======
            ({ value: result, error } = child.tryEvaluate(state, newOptions));
>>>>>>> master
            if (!error) {
                if (FunctionUtils.isLogicTrue(result)) {
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

<<<<<<< HEAD
        return {value: result, error};
=======
        return { value: result, error };
>>>>>>> master
    }
}