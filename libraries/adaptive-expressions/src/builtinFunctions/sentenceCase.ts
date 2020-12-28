/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ValueWithError } from '../expressionEvaluator';
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
    public constructor() {
        super(ExpressionType.SentenceCase, SentenceCase.evaluator);
    }

    /**
     * @private
     */
    private static evaluator(args: any[], options: Options): ValueWithError {
        let locale = options.locale ? options.locale : Intl.DateTimeFormat().resolvedOptions().locale;
        locale = FunctionUtils.determineLocale(args, 2, locale);
        const inputStr = (InternalFunctionUtils.parseStringOrUndefined(args[0]) as any).toLocaleLowerCase(locale);
        if (inputStr === '') {
            return { value: inputStr, error: undefined };
        } else {
            return {
                value: inputStr.charAt(0).toUpperCase() + inputStr.substr(1).toLocaleLowerCase(locale),
                error: undefined,
            };
        }
    }
}
