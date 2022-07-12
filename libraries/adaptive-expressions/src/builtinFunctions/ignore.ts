/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Mark a clause so that MostSpecificSelector will ignore it.
 * MostSpecificSelector considers A &amp; B to be more specific than A, but some clauses are unique and incomparable.
 *
 */
export class Ignore extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Ignore](xref:adaptive-expressions.Ignore) class.
     */
    constructor() {
        super(ExpressionType.Ignore, Ignore.evaluator, ReturnType.Boolean, FunctionUtils.validateUnaryBoolean);
        this.negation = this;
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        return expression.children[0].tryEvaluate(state, options);
    }
}
