/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as d3 from 'd3-format';
import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';
import { Options } from '../options';
import { localeInfo } from '../localeInfo';

/**
 * Format number into required decimal numbers.
 */
export class FormatNumber extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.FormatNumber, FormatNumber.evaluator(), ReturnType.String, FormatNumber.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithOptionsAndError(
            (args: any[], options: Options): any => {
                let value: any = null;
                let error: string;
                let number = args[0];
                let precision = args[1];
                let locale = options.locale ? options.locale : 'en-us';
                locale = FunctionUtils.determineLocale(args, locale, 3);
                if (typeof number !== 'number') {
                    error = `formatNumber first argument ${number} must be a number`;
                } else if (typeof precision !== 'number') {
                    error = `formatNumber second argument ${precision} must be a number`;
                } else if (locale && typeof locale !== 'string') {
                    error = `formatNubmer third argument ${locale} is not a valid locale`;
                } else {
                    const fixedNotation = `,.${precision}f`;
                    const roundedNumber = this.roundToPrecision(number, precision);
                    const formatLocale = localeInfo[locale];
                    if (formatLocale !== undefined) {
                        value = d3.formatLocale(formatLocale).format(fixedNotation)(roundedNumber);
                    } else {
                        value = d3.format(fixedNotation)(roundedNumber);
                    }
                }

                return { value, error };
            });
    }

    private static roundToPrecision = (num: number, digits: number): number => Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);

    private static validator(expr: Expression): void {
        FunctionUtils.validateOrder(expr, [ReturnType.String], ReturnType.Number, ReturnType.Number);
    }
}