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
import { InternalFunctionUtils } from '../functionUtils.internal';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Check whether an expression is false.
 * Return true if the expression is false, or return false if true.
 */
export class Not extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Not](xref:adaptive-expressions.Not) class.
     */
    constructor() {
        super(ExpressionType.Not, Not.evaluator, ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let result = false;
        let error: string;
        const newOptions = new Options(options);
        newOptions.nullSubstitution = undefined;
        ({ value: result, error } = expression.children[0].tryEvaluate(state, newOptions));
        if (!error) {
            result = !InternalFunctionUtils.isLogicTrue(result);
        } else {
            error = undefined;
            result = true;
        }

        return { value: result, error };
    }
}
