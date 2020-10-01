/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TimexProperty } from '@microsoft/recognizers-text-data-types-timex-expression';

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { ReturnType } from '../returnType';

/**
 * Uses the date-time library to provide a date readback.
 */
export class DateReadBack extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.DateReadBack, DateReadBack.evaluator(), ReturnType.String, DateReadBack.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: any[]): any => {
            let value: any;
            let error: string;
            const dateFormat = 'YYYY-MM-DD';
            ({ value, error } = InternalFunctionUtils.parseTimestamp(args[0]));
            if (!error) {
                const timestamp1: Date = new Date(value.format(dateFormat));
                ({ value, error } = InternalFunctionUtils.parseTimestamp(args[1]));
                const timestamp2: string = value.format(dateFormat);
                const timex: TimexProperty = new TimexProperty(timestamp2);

                return { value: timex.toNaturalLanguage(timestamp1), error };
            }
        }, FunctionUtils.verifyString);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, undefined, ReturnType.String, ReturnType.String);
    }
}
