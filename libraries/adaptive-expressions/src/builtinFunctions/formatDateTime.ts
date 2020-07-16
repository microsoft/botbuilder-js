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
 * Return a timestamp in the specified format.
 */
export class FormatDateTime extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.FormatDateTime, FormatDateTime.evaluator(), ReturnType.String, FormatDateTime.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithOptionsAndError(
            (args: any[], options: Options): any => {
                let error: string;
                let arg: any = args[0];
                let format = FunctionUtils.DefaultDateTimeFormat;
                let locale = options.locale ? options.locale : 'en-us';
                ({format, locale} = FunctionUtils.determineFormatAndLocale(args, format, locale, 3));

                if (typeof arg === 'string') {
                    error = FunctionUtils.verifyTimestamp(arg.toString());
                } else {
                    arg = arg.toString();
                }
                let value: any;
                if (!error) {
                    const dateString: string = new Date(arg).toISOString();
                    value = args.length >= 2 ? moment(dateString).utc().locale(locale).format(format) : dateString;
                }

                return {value, error};
            });
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String, ReturnType.String], ReturnType.String);
    }
}