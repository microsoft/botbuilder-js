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
 * Return the date of a specified timestamp in m/dd/yyyy format.
 */
export class DateEva extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Date, DateEva.evaluator(), ReturnType.String, FunctionUtils.validateUnaryString);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => FunctionUtils.parseTimestamp(args[0], (timestamp: Date): string => moment(timestamp).utc().format('M/DD/YYYY')),
            FunctionUtils.verifyString);
    }
}