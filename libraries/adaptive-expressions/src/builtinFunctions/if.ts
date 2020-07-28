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
 * Check whether an expression is true or false. Based on the result, return a specified value.
 */
export class If extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
        super(ExpressionType.If, If.evaluator, ReturnType.Object, If.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
=======
    public constructor() {
        super(ExpressionType.If, If.evaluator, ReturnType.Object, If.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
>>>>>>> master
        let result: any;
        let error: string;
        const newOptions = new Options(options);
        newOptions.nullSubstitution = undefined;
<<<<<<< HEAD
        ({value: result, error} = expression.children[0].tryEvaluate(state, newOptions));
        if (!error && FunctionUtils.isLogicTrue(result)) {
            ({value: result, error} = expression.children[1].tryEvaluate(state, options));
        } else {
            ({value: result, error} = expression.children[2].tryEvaluate(state, options));
        }

        return {value: result, error};
=======
        ({ value: result, error } = expression.children[0].tryEvaluate(state, newOptions));
        if (!error && FunctionUtils.isLogicTrue(result)) {
            ({ value: result, error } = expression.children[1].tryEvaluate(state, options));
        } else {
            ({ value: result, error } = expression.children[2].tryEvaluate(state, options));
        }

        return { value: result, error };
>>>>>>> master
    }

    private static validator(expr: Expression): void {
        FunctionUtils.validateArityAndAnyType(expr, 3, 3);
    }
}