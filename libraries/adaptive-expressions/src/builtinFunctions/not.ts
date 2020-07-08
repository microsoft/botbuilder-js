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

export class Not extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Not, Not.evaluator, ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    public static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
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