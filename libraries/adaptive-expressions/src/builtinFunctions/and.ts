/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Return true if all expressions are true or return false if at least one expression is false.
 */
export class And extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.And, And.evaluator, ReturnType.Boolean, FunctionUtils.validateAtLeastOne);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): { value: any; error: string } {
        let result = true;
        let error: string;
        for (const child of expression.children) {
            const newOptions = new Options(options);
            newOptions.nullSubstitution = undefined;
            ({ value: result, error } = child.tryEvaluate(state, newOptions));
            if (!error) {
                if (FunctionUtils.isLogicTrue(result)) {
                    result = true;
                } else {
                    result = false;
                    break;
                }
            } else {
                result = false;
                error = undefined;
                break;
            }
        }

        return { value: result, error };
    }
}