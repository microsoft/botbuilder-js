/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import moment from 'moment';

/**
 * Return the day of the year from a timestamp.
 */
export class DayOfYear extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.DayOfYear, DayOfYear.evaluator(), ReturnType.Number, FunctionUtils.validateUnaryString);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => FunctionUtils.parseTimestamp(args[0], (timestamp: Date): number => moment(timestamp).utc().dayOfYear()),
            FunctionUtils.verifyString);
    }
}