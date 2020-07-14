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
 * Converts the specified string to sentence case.
 */
export class SentenceCase extends StringTransformEvaluator {
    public constructor() {
        super(ExpressionType.SentenceCase, SentenceCase.evaluator, FunctionUtils.validateUnaryOrBinaryString);
    }

    private static evaluator(args: any[], options: Options): string {
        let locale = options.locale;
        locale = FunctionUtils.determineLocale(args, locale, 2);
        const inputStr = String(FunctionUtils.parseStringOrNull(args[0])).toLocaleLowerCase(locale);
        if (inputStr === '') {
            return inputStr;
        } else {
            return inputStr.charAt(0).toLocaleUpperCase(locale) + inputStr.substr(1).toLocaleLowerCase(locale);
        }
    }
}