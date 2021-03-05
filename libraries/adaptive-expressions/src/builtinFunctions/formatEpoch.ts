/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import dayjs from 'dayjs';

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Return a timestamp in the specified format from UNIX time (also know as Epoch time, POSIX time, UNIX Epoch time).
 */
export class FormatEpoch extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [FormatEpoch](xref:adaptive-expressions.FormatEpoch) class.
     */
    public constructor() {
        super(ExpressionType.FormatEpoch, FormatEpoch.evaluator(), ReturnType.String, FormatEpoch.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithOptionsAndError((args: readonly unknown[], options: Options): ValueWithError => {
            let error: string;
            let arg: unknown = args[0];
            let locale = options.locale ? options.locale : Intl.DateTimeFormat().resolvedOptions().locale;
            let format = FunctionUtils.DefaultDateTimeFormat;
            if (typeof arg !== 'number') {
                error = `formatEpoch first argument ${arg} must be a number`;
            } else {
                // Convert to ms
                arg = arg * 1000;
            }

            let value: unknown;
            if (!error) {
                ({ format, locale } = FunctionUtils.determineFormatAndLocale(args, 3, format, locale));
                const dateString: string = new Date(arg as number).toISOString();
                value = dayjs(dateString).locale(locale).utc().format(format);
            }

            return { value, error };
        });
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String, ReturnType.String], ReturnType.Number);
    }
}
