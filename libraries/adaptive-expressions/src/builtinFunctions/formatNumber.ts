/* eslint-disable security/detect-object-injection */
/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { formatLocale as d3formatLocale, format as d3format } from 'd3-format';
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
    /**
     * Initializes a new instance of the [FormatNumber](xref:adaptive-expressions.FormatNumber) class.
     */
    constructor() {
        super(ExpressionType.FormatNumber, FormatNumber.evaluator(), ReturnType.String, FormatNumber.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithOptionsAndError((args: unknown[], options: Options): {
            value: unknown;
            error: string;
        } => {
            let value: unknown = null;
            let error: string;
            const number = args[0];
            const precision = args[1];
            let locale = options.locale ? options.locale : Intl.DateTimeFormat().resolvedOptions().locale;
            locale = FunctionUtils.determineLocale(args, 3, locale);
            if (!FunctionUtils.isNumber(number)) {
                error = `formatNumber first argument ${number} must be a number`;
            } else if (!FunctionUtils.isNumber(precision)) {
                error = `formatNumber second argument ${precision} must be a number`;
            } else if (locale && typeof locale !== 'string') {
                error = `formatNubmer third argument ${locale} is not a valid locale`;
            } else {
                const fixedNotation = `,.${precision}f`;
                const roundedNumber = this.roundToPrecision(number, precision);
                const formatLocale = localeInfo[locale];
                if (formatLocale !== undefined) {
                    value = d3formatLocale(formatLocale).format(fixedNotation)(roundedNumber);
                } else {
                    value = d3format(fixedNotation)(roundedNumber);
                }
            }

            return { value, error };
        });
    }

    private static roundToPrecision = (num: number, digits: number): number =>
        Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);

    private static validator(expr: Expression): void {
        FunctionUtils.validateOrder(expr, [ReturnType.String], ReturnType.Number, ReturnType.Number);
    }
}
