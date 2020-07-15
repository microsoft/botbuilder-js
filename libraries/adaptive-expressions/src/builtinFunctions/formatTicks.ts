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
import bigInt from 'big-integer';
import { Options } from '../options';

/**
 * Return a timestamp in the specified format from ticks.
 */
export class FormatTicks extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.FormatTicks, FormatTicks.evaluator(), ReturnType.String, FormatTicks.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithOptionsAndError(
            (args: any[], options: Options): any => {
                let error: string;
                let arg: any = args[0];
                let format = FunctionUtils.DefaultDateTimeFormat;
                let locale = options.locale ?  options.locale : 'en-us';

                ({format, locale} = FunctionUtils.determineFormatAndLocale(args, format, locale, 3));

                if (typeof arg === 'number') {
                    arg = bigInt(arg);
                }
                if (typeof arg === 'string') {
                    arg = bigInt(arg);
                }
                if (!bigInt.isInstance(arg)) {
                    error = `formatTicks first argument ${arg} is not a number, numeric string or bigInt`;
                } else {
                    // Convert to ms
                    arg = ((arg.subtract(FunctionUtils.UnixMilliSecondToTicksConstant)).divide(FunctionUtils.MillisecondToTickConstant)).toJSNumber();
                }

                let value: any;
                if (!error) {
                    value = moment(new Date(arg)).utc().locale(locale).format(format);
                }

                return {value, error};
            });
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String, ReturnType.String], ReturnType.Number);
    }
}