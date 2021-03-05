/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Return the number of items in a collection.
 */
export class Count extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Count](xref:adaptive-expressions.Count) class.
     */
    public constructor() {
        super(ExpressionType.Count, Count.evaluator(), ReturnType.Number, Count.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: readonly unknown[]): number => {
            let count: number;
            const firstChild = args[0];
            if (typeof firstChild === 'string') {
                count = firstChild.length;
            } else if (Array.isArray(firstChild)) {
                count = firstChild.length;
            } else if (firstChild instanceof Map) {
                count = firstChild.size;
            } else if (typeof firstChild === 'object') {
                count = Object.keys(firstChild).length;
            }

            return count;
        }, FunctionUtils.verifyContainer);
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [], ReturnType.String | ReturnType.Array);
    }
}
