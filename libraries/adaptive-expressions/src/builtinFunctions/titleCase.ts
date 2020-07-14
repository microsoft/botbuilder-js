/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { StringTransformEvaluator } from './stringTransformEvaluator';
import { FunctionUtils } from '../functionUtils';
import { ExpressionType } from '../expressionType';
import { Options } from '../options';

/**
 * Converts the specified string to title case.
 */
export class TitleCase extends StringTransformEvaluator {
    public constructor() {
        super(ExpressionType.TitleCase, TitleCase.evaluator, FunctionUtils.validateUnaryOrBinaryString);
    }

    private static evaluator(args: any[], options: Options): string {
        let locale = options.locale;
        locale = FunctionUtils.determineLocale(args, locale, 2);
        const inputStr = String(FunctionUtils.parseStringOrNull(args[0])).toLocaleLowerCase(locale);
        if (inputStr === '') {
            return inputStr;
        } else {
            return inputStr.replace(/\w\S*/g, (txt): string => txt.charAt(0).toLocaleUpperCase(locale) + txt.substr(1).toLocaleLowerCase(locale));
        }
    }
}