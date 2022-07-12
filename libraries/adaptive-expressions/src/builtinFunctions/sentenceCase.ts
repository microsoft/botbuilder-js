/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { Options } from '../options';
import { StringTransformEvaluator } from './stringTransformEvaluator';

/**
 * Capitalizing only the first word and leave others lowercase.
 */
export class SentenceCase extends StringTransformEvaluator {
    /**
     * Initializes a new instance of the [SentenceCase](xref:adaptive-expressions.SentenceCase) class.
     */
    constructor() {
        super(ExpressionType.SentenceCase, SentenceCase.evaluator, FunctionUtils.validateUnaryOrBinaryString);
    }

    /**
     * @private
     */
    private static evaluator(args: unknown[], options: Options): string {
        let locale = options.locale ? options.locale : Intl.DateTimeFormat().resolvedOptions().locale;
        locale = FunctionUtils.determineLocale(args, 2, locale);
        const firstArg = args[0];
        if (typeof firstArg === 'string' || firstArg === undefined) {
            const inputStr = (InternalFunctionUtils.parseStringOrUndefined(firstArg) as any).toLocaleLowerCase(locale);
            if (inputStr === '') {
                return inputStr;
            } else {
                return inputStr.charAt(0).toUpperCase() + inputStr.substr(1).toLocaleLowerCase(locale);
            }
        }
    }
}
