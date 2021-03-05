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
 * Return the first item from a string or array.
 */
export class First extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [First](xref:adaptive-expressions.First) class.
     */
    public constructor() {
        super(ExpressionType.First, First.evaluator(), ReturnType.Object, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: readonly unknown[]): unknown => {
            let first: unknown;
            const firstChild = args[0];
            if (typeof firstChild === 'string' && firstChild.length > 0) {
                first = firstChild[0];
            }

            if (Array.isArray(firstChild) && firstChild.length > 0) {
                first = InternalFunctionUtils.accessIndex(firstChild, 0).value;
            }

            return first;
        });
    }
}
