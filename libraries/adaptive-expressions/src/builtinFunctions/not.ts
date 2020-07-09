/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator } from '../expressionEvaluator';
import { Expression } from '../expression';
import { ReturnType } from '../returnType';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';

/**
 * Check whether an expression is false.
 * Return true if the expression is false, or return false if true.
 */
export class Not extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Not, Not.evaluator, ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let result = false;
        let error: string;
        const newOptions = new Options(options);
        newOptions.nullSubstitution = undefined;
        ({value: result, error} = expression.children[0].tryEvaluate(state, newOptions));
        if (!error) {
            result = !FunctionUtils.isLogicTrue(result);
        } else {
            error = undefined;
            result = true;
        }

        return {value: result, error};
    }
}