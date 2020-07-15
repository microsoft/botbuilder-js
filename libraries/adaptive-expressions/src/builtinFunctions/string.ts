/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType } from '../returnType';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { Options } from '../options';

/**
 * Return the string version of a value.
 */
export class String extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.String, String.evaluator(), ReturnType.String, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithOptionsAndError((args: any[], options: Options): {value: string; error: string} => {
            let error: string;
            let value: string;
            let locale = options.locale ? options.locale : 'en-us';
            if (args.length === 2 && typeof args[1] !== 'string') {
                error = `the second argument ${args[1]} should be a locale string.`;
            } else {
                locale = FunctionUtils.determineLocale(args, locale, 2);
            }

            if (!error) {
                if (typeof args[0] === 'number') {
                    value = args[0].toLocaleString(locale);
                } else if (args[0] instanceof Date) {
                    value = args[0].toLocaleDateString(locale);
                } else {
                    value = JSON.stringify(args[0])
                        .replace(/(^\'*)/g, '')
                        .replace(/(\'*$)/g, '')
                        .replace(/(^\"*)/g, '')
                        .replace(/(\"*$)/g, '');
                }
            }

            return {value, error};
        });
    }
}