/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import moment from 'moment';

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Return the current timestamp.
 */
export class UtcNow extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [UtcNow](xref:adaptive-expressions.UtcNow) class.
     */
    public constructor() {
        super(ExpressionType.UtcNow, UtcNow.evaluator(), ReturnType.String, UtcNow.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithOptionsAndError(
            (args: any[], options: Options): ValueWithError => {
                let locale = options.locale ? options.locale : Intl.DateTimeFormat().resolvedOptions().locale;
                let format = FunctionUtils.DefaultDateTimeFormat;
                ({ format, locale } = FunctionUtils.determineFormatAndLocale(args, 2, format, locale));

                return { value: moment(new Date()).utc().format(format), error: undefined };
            }
        );
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String, ReturnType.String]);
    }
}
