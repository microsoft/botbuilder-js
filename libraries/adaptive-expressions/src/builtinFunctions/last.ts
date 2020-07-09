/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType } from '../returnType';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

/**
 * Return the last item from a collection.
 */
export class Last extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Last, Last.evaluator(), ReturnType.Object, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): any => {
                let last: any;
                if (typeof args[0] === 'string' && args[0].length > 0) {
                    last = args[0][args[0].length - 1];
                }

                if (Array.isArray(args[0]) && args[0].length > 0) {
                    last = FunctionUtils.accessIndex(args[0], args[0].length - 1).value;
                }

                return last;
            });
    }
}