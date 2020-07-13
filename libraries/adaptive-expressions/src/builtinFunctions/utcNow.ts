/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { Expression } from '../expression';
import { ReturnType } from '../returnType';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import moment from 'moment';

/**
 * Return the current timestamp.
 */
export class UtcNow extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.UtcNow, UtcNow.evaluator(), ReturnType.String, UtcNow.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): string => args.length === 1 ? moment(new Date()).utc().format(args[0]) : new Date().toISOString(),
            FunctionUtils.verifyString);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String]);
    }
}