/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { FunctionUtils } from '..';
import { ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { Options } from '../options';
import { StringTransformEvaluator } from './stringTransformEvaluator';

/**
 * Converts the specified string to title case.
 */
export class TitleCase extends StringTransformEvaluator {
    /**
     * Initializes a new instance of the [TitleCase](xref:adaptive-expressions.TitleCase) class.
     */
    public constructor() {
        super(ExpressionType.TitleCase, TitleCase.evaluator);
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
                value: inputStr.replace(
                    /\w\S*/g,
                    (txt): string => txt.charAt(0).toUpperCase() + txt.substr(1).toLocaleLowerCase(locale)
                ),
                error: undefined,
            };
        }
    }
}
