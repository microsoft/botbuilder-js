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
import { ReturnType } from '../returnType';

/**
 * Return true if a given input is a UTC ISO format (YYYY-MM-DDTHH:mm:ss.fffZ) timestamp string.
 */
export class IsDateTime extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.IsDateTime, IsDateTime.evaluator(), ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): boolean => typeof args[0] === 'string' && FunctionUtils.verifyISOTimestamp(args[0]) === undefined);
    }
}
