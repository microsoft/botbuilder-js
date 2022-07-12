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
 * Check whether an expression is true or false. Based on the result, return a specified value.
 */
export class If extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [If](xref:adaptive-expressions.If) class.
     */
    constructor() {
        super(ExpressionType.If, If.evaluator, ReturnType.Object, If.validator);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let result: any;
        let error: string;
        const newOptions = new Options(options);
        newOptions.nullSubstitution = undefined;
        ({ value: result, error } = expression.children[0].tryEvaluate(state, newOptions));
        if (!error && InternalFunctionUtils.isLogicTrue(result)) {
            ({ value: result, error } = expression.children[1].tryEvaluate(state, options));
        } else {
            ({ value: result, error } = expression.children[2].tryEvaluate(state, options));
        }

        return { value: result, error };
    }

    /**
     * @private
     */
    private static validator(expr: Expression): void {
        FunctionUtils.validateArityAndAnyType(expr, 3, 3);
    }
}
