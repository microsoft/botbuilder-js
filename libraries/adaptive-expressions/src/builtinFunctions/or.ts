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
 * Check whether at least one expression is true.
 * Return true if at least one expression is true, or return false if all are false.
 */
export class Or extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
        super(ExpressionType.Or, Or.evaluator, ReturnType.Boolean, FunctionUtils.validateAtLeastOne);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
=======
    public constructor() {
        super(ExpressionType.Or, Or.evaluator, ReturnType.Boolean, FunctionUtils.validateAtLeastOne);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
>>>>>>> master
        let result = false;
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
                    break;
                }
            } else {
                error = undefined;
            }
        }

<<<<<<< HEAD
        return {value: result, error};
=======
        return { value: result, error };
>>>>>>> master
    }
}