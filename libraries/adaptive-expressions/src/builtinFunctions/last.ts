/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { ReturnType } from '../returnType';

/**
 * Return the last item from a collection.
 */
export class Last extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Last](xref:adaptive-expressions.Last) class.
     */
    public constructor() {
        super(ExpressionType.Last, Last.evaluator(), ReturnType.Object, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: readonly unknown[]): unknown => {
            let last: unknown;
            const firstChild = args[0];
            if (typeof firstChild === 'string' && firstChild.length > 0) {
                last = firstChild[firstChild.length - 1];
            }

            if (Array.isArray(firstChild) && firstChild.length > 0) {
                last = InternalFunctionUtils.accessIndex(firstChild, firstChild.length - 1).value;
            }

            return last;
        });
    }
}
