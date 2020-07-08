/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

/**
 * Return the number of items in a collection.
 */
export class Count extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Count, Count.evaluator(), ReturnType.Number, Count.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): number => {
                let count: number;
                if (typeof args[0] === 'string' || Array.isArray(args[0])) {
                    count = args[0].length;
                } else if (args[0] instanceof Map) {
                    count = args[0].size;
                } else if (typeof args[0] == 'object') {
                    count = Object.keys(args[0]).length;
                }

                return count;
            }, FunctionUtils.verifyContainer);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [], ReturnType.String | ReturnType.Array);
    }
}