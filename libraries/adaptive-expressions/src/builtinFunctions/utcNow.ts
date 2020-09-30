/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import moment from 'moment';

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Return the current timestamp.
 */
export class UtcNow extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the `UtcNow` class.
     */
    public constructor() {
        super(ExpressionType.UtcNow, UtcNow.evaluator(), ReturnType.String, UtcNow.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): string => args.length === 1 ? moment(new Date()).utc().format(args[0]) : new Date().toISOString(),
            FunctionUtils.verifyString);
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String]);
    }
}
