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
import moment from 'moment';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';

/**
 * Subtract a number of time units from a timestamp.
 */
export class SubtractFromTime extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.SubtractFromTime, SubtractFromTime.evaluator, ReturnType.String, SubtractFromTime.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: any;
        let args: any[];
        let format = FunctionUtils.DefaultDateTimeFormat;
        let locale = options.locale ? options.locale : 'en-us';
        ({args, error} = FunctionUtils.evaluateChildren(expression, state, options));

        if (!error) {
            ({format, locale} = FunctionUtils.determineFormatAndLocale(args, format, locale, 5));
        }

        if (!error) {
            if (typeof args[0] === 'string' && Number.isInteger(args[1]) && typeof args[2] === 'string') {
                const {duration, tsStr} = FunctionUtils.timeUnitTransformer(args[1], args[2]);
                if (tsStr === undefined) {
                    error = `${args[2]} is not a valid time unit.`;
                } else {
                    const dur: any = duration;
                    ({value, error} = FunctionUtils.parseTimestamp(args[0], (dt: Date): string => {
                        return moment(dt).utc().subtract(dur, tsStr).locale(locale).format(format);
                    }));
                }
            } else {
                error = `${expression} can't evaluate.`;
            }
        }

        return {value, error};
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String, ReturnType.String], ReturnType.String, ReturnType.Number, ReturnType.String);
    }
}