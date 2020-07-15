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
 * Return the current timestamp.
 */
export class UtcNow extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.UtcNow, UtcNow.evaluator(), ReturnType.String, UtcNow.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithOptionsAndError(
            (args: any[], options: Options): {value: any; error: string} => 
            {
                let format = FunctionUtils.DefaultDateTimeFormat;
                let locale = options.locale ? options.locale : 'en-us';
                let value: string;
                let error: string;
                ({format, locale} = FunctionUtils.determineFormatAndLocale(args, format, locale, 2));
                value = moment(new Date()).utc().locale(locale).format(format);

                return {value, error};
            },
            FunctionUtils.verifyString);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String, ReturnType.String]);
    }
}