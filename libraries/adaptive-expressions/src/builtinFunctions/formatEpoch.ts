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
import { Options } from '../options';

/**
 * Return a timestamp in the specified format from UNIX time (also know as Epoch time, POSIX time, UNIX Epoch time).
 */
export class FormatEpoch extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.FormatEpoch, FormatEpoch.evaluator(), ReturnType.String, FormatEpoch.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithErrorAndOptions(
            (args: any[], options: Options): any => {
                let error: string;
                let arg: any = args[0];
                let locale = options.locale ? options.locale : 'en-us';
                let format = FunctionUtils.DefaultDateTimeFormat;
                ({format, locale} = FunctionUtils.determineFormatAndLocale(args, format, locale, 3));
                
                if (typeof arg !== 'number') {
                    error = `formatEpoch first argument ${arg} must be a number.`;
                } else {
                    // Convert to ms
                    arg = arg * 1000;
                }

                let value: any;
                if (!error) {
                    const dateString: string = new Date(arg).toLocaleString(locale);
                    value = args.length === 2 ? moment(dateString).format(format) : dateString;
                }

                return {value, error};
            });
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.Number);
    }
}