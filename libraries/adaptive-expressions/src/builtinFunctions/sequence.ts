/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { forEach } from 'lodash';
import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Check whether an expression is true or false. Based on the result, return a specified value.
 */
export class Sequence extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [If](xref:adaptive-expressions.If) class.
     */
    public constructor() {
        super(ExpressionType.Sequence, Sequence.evaluator, ReturnType.Object);
    }

    /**
     * @private
     */
    private static evaluator(expressions: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let result: ValueWithError;
        for (const expression of expressions.children) {
            result = expression.tryEvaluate(state, options);
            if (result.error) {
                return result;
            }
        };

        return result;
    }
}
