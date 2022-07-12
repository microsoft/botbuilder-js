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
    constructor() {
        super(ExpressionType.Last, Last.evaluator(), ReturnType.Object, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): any => {
            let last: any;
            if (typeof args[0] === 'string' && args[0].length > 0) {
                last = args[0][args[0].length - 1];
            }

            if (Array.isArray(args[0]) && args[0].length > 0) {
                last = InternalFunctionUtils.accessIndex(args[0], args[0].length - 1).value;
            }

            return last;
        });
    }
}
