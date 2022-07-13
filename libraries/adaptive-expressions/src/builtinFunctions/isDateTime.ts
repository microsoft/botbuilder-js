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
 * Return true if a given input is a UTC ISO format (YYYY-MM-DDTHH:mm:ss.fffZ) timestamp string.
 */
export class IsDateTime extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [IsDateTime](xref:adaptive-expressions.IsDateTime) class.
     */
    constructor() {
        super(ExpressionType.IsDateTime, IsDateTime.evaluator(), ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): boolean =>
                typeof args[0] === 'string' && InternalFunctionUtils.verifyISOTimestamp(args[0]) === undefined
        );
    }
}
