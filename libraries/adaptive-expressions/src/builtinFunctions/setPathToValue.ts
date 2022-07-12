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
 * Set path in a JSON object to value.
 */
export class SetPathToValue extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [SetPathToValue](xref:adaptive-expressions.SetPathToValue) class.
     */
    constructor() {
        super(ExpressionType.SetPathToValue, SetPathToValue.evaluator, ReturnType.Object, FunctionUtils.validateBinary);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        const { path, left, error } = FunctionUtils.tryAccumulatePath(expression.children[0], state, options);
        if (error !== undefined) {
            return { value: undefined, error };
        }

        if (left) {
            // the expression can't be fully merged as a path
            return { value: undefined, error: `${expression.children[0].toString()} is not a valid path to set value` };
        }
        const { value, error: err } = expression.children[1].tryEvaluate(state, options);
        if (err) {
            return { value: undefined, error: err };
        }

        state.setValue(path, value);
        return { value, error: undefined };
    }
}
