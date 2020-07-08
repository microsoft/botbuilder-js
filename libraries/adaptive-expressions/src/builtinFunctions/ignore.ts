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
 * Mark a clause so that MostSpecificSelector will ignore it.
 * MostSpecificSelector considers A &amp; B to be more specific than A, but some clauses are unique and incomparable.
 * 
 */
export class Ignore extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Ignore, Ignore.evaluator, ReturnType.Boolean, FunctionUtils.validateUnaryBoolean);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        return expression.children[0].tryEvaluate(state, options);
    }
}