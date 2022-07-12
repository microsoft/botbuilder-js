/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Return a timestamp in the specified format.
 * Format reference: https://docs.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings
 */
export class FormatDateTime extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [FormatDateTime](xref:adaptive-expressions.FormatDateTime) class.
     */
    constructor() {
        super(ExpressionType.FormatDateTime, FormatDateTime.evaluator(), ReturnType.String, FormatDateTime.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithOptionsAndError((args: unknown[], options: Options): any => {
            let error: string;
            let arg: any = args[0];
            let locale = options.locale ? options.locale : Intl.DateTimeFormat().resolvedOptions().locale;
            let format = FunctionUtils.DefaultDateTimeFormat;
            if (typeof arg === 'string') {
                error = InternalFunctionUtils.verifyTimestamp(arg.toString());
            } else {
                arg = arg.toISOString();
            }
            let value: any;
            if (!error) {
                ({ format, locale } = FunctionUtils.determineFormatAndLocale(args, 3, format, locale));
                let dateString: string;
                if (arg.endsWith('Z')) {
                    dateString = new Date(arg).toISOString();
                } else {
                    try {
                        dateString = new Date(`${arg}Z`).toISOString();
                    } catch {
                        dateString = new Date(arg).toISOString();
                    }
                }

                value = dayjs(dateString).locale(locale).utc().format(format);
            }

            return { value, error };
        });
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String, ReturnType.String], ReturnType.String);
    }
}
