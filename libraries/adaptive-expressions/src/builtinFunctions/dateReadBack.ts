/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import {TimexProperty} from '@microsoft/recognizers-text-data-types-timex-expression';

export class DateReadBack extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.DateReadBack, DateReadBack.evaluator(), ReturnType.String, DateReadBack.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => {
                let value: any;
                let error: string;
                const dateFormat = 'YYYY-MM-DD';
                ({value, error} = FunctionUtils.parseTimestamp(args[0]));
                if (!error) {
                    const timestamp1: Date = new Date(value.format(dateFormat));
                    ({value, error} = FunctionUtils.parseTimestamp(args[1]));
                    const timestamp2: string = value.format(dateFormat);
                    const timex: TimexProperty = new TimexProperty(timestamp2);

                    return {value: timex.toNaturalLanguage(timestamp1), error};
                }
            },
            FunctionUtils.verifyString);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, undefined, ReturnType.String, ReturnType.String);
    }
}