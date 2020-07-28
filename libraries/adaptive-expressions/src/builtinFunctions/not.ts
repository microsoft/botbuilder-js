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
 * Check whether an expression is false.
 * Return true if the expression is false, or return false if true.
 */
export class Not extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
        super(ExpressionType.Not, Not.evaluator, ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
=======
    public constructor() {
        super(ExpressionType.Not, Not.evaluator, ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
>>>>>>> master
        let result = false;
        let error: string;
        const newOptions = new Options(options);
        newOptions.nullSubstitution = undefined;
<<<<<<< HEAD
        ({value: result, error} = expression.children[0].tryEvaluate(state, newOptions));
=======
        ({ value: result, error } = expression.children[0].tryEvaluate(state, newOptions));
>>>>>>> master
        if (!error) {
            result = !FunctionUtils.isLogicTrue(result);
        } else {
            error = undefined;
            result = true;
        }

<<<<<<< HEAD
        return {value: result, error};
=======
        return { value: result, error };
>>>>>>> master
    }
}