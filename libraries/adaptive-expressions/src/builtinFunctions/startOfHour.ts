/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator } from '../expressionEvaluator';
import { Expression } from '../expression';
import { ReturnType } from '../returnType';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import moment from 'moment';

/**
 * Return the start of the hour for a timestamp.
 */
export class StartOfHour extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.StartOfHour, StartOfHour.evaluator, ReturnType.String, StartOfHour.validator);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: string;
        let args: any[];
        let format = FunctionUtils.DefaultDateTimeFormat;
        let locale = options.locale ? options.locale : 'en-us';
        ({args, error} = FunctionUtils.evaluateChildren(expr, state, options));

        if (!error) {
            ({format, locale} = FunctionUtils.determineFormatAndLocale(args, format, locale, 3));
        }

        if (!error) {
            if (typeof (args[0]) === 'string') {
                ({value, error} = StartOfHour.evalStartOfHour(args[0], format, locale));
            } else {
                error = `${expr} cannot evaluate`;
            }
        }

        return {value, error};
    }

    private static evalStartOfHour(timeStamp: string, format?: string, locale?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: any;
        ({value: parsed, error} = FunctionUtils.parseTimestamp(timeStamp));
        if (!error) {
            const startofHour = moment(parsed).utc().minutes(0).second(0).millisecond(0);
            ({value: result, error} = FunctionUtils.returnFormattedTimeStampStr(startofHour, format, locale));
        }

        return {value: result, error};
    }

    private static validator(expr: Expression): void {
        FunctionUtils.validateOrder(expr, [ReturnType.String, ReturnType.String], ReturnType.String);
    }
}