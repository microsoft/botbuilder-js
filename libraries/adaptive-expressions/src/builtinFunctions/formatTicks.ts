/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import bigInt from 'big-integer';
import dayjs from 'dayjs';

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Return a timestamp in the specified format from ticks.
 */
export class FormatTicks extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [FormatTicks](xref:adaptive-expressions.FormatTicks) class.
     */
    constructor() {
        super(ExpressionType.FormatTicks, FormatTicks.evaluator(), ReturnType.String, FormatTicks.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithOptionsAndError(
            (args: unknown[], options: Options): ValueWithError => {
                let error: string;
                let arg = args[0];
                let locale = options.locale ? options.locale : Intl.DateTimeFormat().resolvedOptions().locale;
                let format = FunctionUtils.DefaultDateTimeFormat;
                if (FunctionUtils.isNumber(arg)) {
                    arg = bigInt(arg);
                }
                if (typeof arg === 'string') {
                    arg = bigInt(arg);
                }
                if (!bigInt.isInstance(arg)) {
                    error = `formatTicks first argument ${arg} is not a number, numeric string or bigInt`;
                } else {
                    // Convert to ms
                    arg = arg
                        .subtract(InternalFunctionUtils.UnixMilliSecondToTicksConstant)
                        .divide(InternalFunctionUtils.MillisecondToTickConstant)
                        .toJSNumber();
                }

                let value: any;
                if (!error) {
                    ({ format, locale } = FunctionUtils.determineFormatAndLocale(args, 3, format, locale));
                    if (FunctionUtils.isNumber(arg)) {
                        const dateString: string = new Date(arg).toISOString();
                        value = dayjs(dateString).locale(locale).utc().format(format);
                    }
                }

                return { value, error };
            }
        );
    }

    /**
     * @param expression
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String, ReturnType.String], ReturnType.Number);
    }
}
