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
import { InternalFunctionUtils } from '../functionUtils.internal';

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
            (args: readonly unknown[], options: Options): ValueWithError => {
                let result: string;
                let error: string;
                let locale = options.locale ? options.locale : Intl.DateTimeFormat().resolvedOptions().locale;
                if (!error) {
                    locale = FunctionUtils.determineLocale(args, 2, locale);
                }

                if (!error) {
                    const firstChild = args[0];
                    if (typeof firstChild === 'string') {
                        result = firstChild;
                    } else if (FunctionUtils.isNumber(firstChild)) {
                        const formatLocale = localeInfo[locale];
                        const tempStrValue = firstChild.toString();
                        let precision = 0;
                        if (tempStrValue.includes('.')) {
                            precision = tempStrValue.split('.')[1].length;
                        }

                        const fixedNotation = `,.${precision}f`;
                        if (formatLocale !== undefined) {
                            result = d3formatLocale(formatLocale).format(fixedNotation)(firstChild);
                        } else {
                            result = d3format(fixedNotation)(firstChild);
                        }
                    } else if (firstChild instanceof Date) {
                        result = firstChild.toLocaleDateString(locale);
                    } else {
                        result = InternalFunctionUtils.commonStringify(firstChild);
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
