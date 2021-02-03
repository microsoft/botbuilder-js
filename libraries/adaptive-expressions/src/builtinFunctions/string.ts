/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { formatLocale as d3formatLocale, format as d3format } from 'd3-format';
import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { Options } from '../options';
import { ReturnType } from '../returnType';
import { localeInfo } from '../localeInfo';
import { Expression } from '../expression';

/**
 * Return the string version of a value.
 */
export class String extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [String](xref:adaptive-expressions.String) class.
     */
    public constructor() {
        super(ExpressionType.String, String.evaluator(), ReturnType.String, String.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithOptionsAndError(
            (args: any[], options: Options): ValueWithError => {
                let result: any;
                let error: string;
                let locale = options.locale ? options.locale : Intl.DateTimeFormat().resolvedOptions().locale;
                if (!error) {
                    locale = FunctionUtils.determineLocale(args, 2, locale);
                }

                if (!error) {
                    if (typeof args[0] === 'string') {
                        result = args[0];
                    } else if (typeof args[0] === 'number') {
                        const formatLocale = localeInfo[locale];
                        const tempStrValue = args[0].toString();
                        let precision = 0;
                        if (tempStrValue.includes('.')) {
                            precision = tempStrValue.split('.')[1].length;
                        }

                        const fixedNotation = `,.${precision}f`;
                        if (formatLocale !== undefined) {
                            result = d3formatLocale(formatLocale).format(fixedNotation)(args[0]);
                        } else {
                            result = d3format(fixedNotation)(args[0]);
                        }
                    } else if (args[0] instanceof Date) {
                        result = args[0].toLocaleDateString(locale);
                    } else {
                        result = JSON.stringify(args[0])
                            .replace(/(^['"]*)/g, '') // remove the starting single or double quote
                            .replace(/(['"]*$)/g, ''); // remove the ending single or double quote
                    }
                }

                return { value: result, error: error };
            }
        );
    }

    /**
     * @private
     */
    private static validator(expr: Expression): void {
        FunctionUtils.validateOrder(expr, [ReturnType.String], ReturnType.Object);
    }
}
