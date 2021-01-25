/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Return the string version of a value.
 */
export class String extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [String](xref:adaptive-expressions.String) class.
     */
    public constructor() {
        super(ExpressionType.String, String.evaluator(), ReturnType.String, FunctionUtils.validateUnary);
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
                        result = args[0].toLocaleString(locale);
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
}
