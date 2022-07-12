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
 * Check whether at least one expression is true.
 * Return true if at least one expression is true, or return false if all are false.
 */
export class Or extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Or](xref:adaptive-expressions.Or) class.
     */
    constructor() {
        super(ExpressionType.Or, Or.evaluator, ReturnType.Boolean, FunctionUtils.validateAtLeastOne);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let result = false;
        let error: string;
        for (const child of expression.children) {
            const newOptions = new Options(options);
            newOptions.nullSubstitution = undefined;
            ({ value: result, error } = child.tryEvaluate(state, newOptions));
            if (!error) {
                if (InternalFunctionUtils.isLogicTrue(result)) {
                    result = true;
                    break;
                }
            } else {
                error = undefined;
            }
        }

        return { value: result, error };
    }
}
