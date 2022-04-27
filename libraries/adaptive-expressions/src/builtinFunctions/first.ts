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
    constructor() {
        super(ExpressionType.First, First.evaluator(), ReturnType.Object, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): any => {
            let first: any;
            if (typeof args[0] === 'string' && args[0].length > 0) {
                first = args[0][0];
            }

            if (Array.isArray(args[0]) && args[0].length > 0) {
                first = InternalFunctionUtils.accessIndex(args[0], 0).value;
            }

            return first;
        });
    }
}
