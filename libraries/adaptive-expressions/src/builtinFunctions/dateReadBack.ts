/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TimexProperty } from '@microsoft/recognizers-text-data-types-timex-expression';
import dayjs from 'dayjs';
import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { ReturnType } from '../returnType';

/**
 * Uses the date-time library to provide a date readback.
 */
export class DateReadBack extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [DateReadBack](xref:adaptive-expressions.DateReadBack) class.
     */
    constructor() {
        super(ExpressionType.DateReadBack, DateReadBack.evaluator(), ReturnType.String, DateReadBack.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: any[]): ValueWithError => {
            const dateFormat = 'YYYY-MM-DD';
            let error = InternalFunctionUtils.verifyISOTimestamp(args[0]);
            if (!error) {
                const timestamp1 = dayjs(args[0]).toDate();
                error = InternalFunctionUtils.verifyISOTimestamp(args[1]);
                if (!error) {
                    const timestamp2 = dayjs(args[1]).format(dateFormat);
                    const timex = new TimexProperty(timestamp2);

                    return { value: timex.toNaturalLanguage(timestamp1), error };
                }
            }
            return { value: undefined, error };
        }, FunctionUtils.verifyString);
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, undefined, ReturnType.String, ReturnType.String);
    }
}
