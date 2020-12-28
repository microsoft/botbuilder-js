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
 * Return a string in lowercase format.
 * If a character in the string doesn't have a lowercase version, that character stays unchanged in the returned string.
 */
export class ToLower extends StringTransformEvaluator {
    /**
     * Initializes a new instance of the [ToLower](xref:adaptive-expressions.ToLower) class.
     */
    public constructor() {
        super(ExpressionType.ToLower, ToLower.evaluator);
    }

    /**
     * @private
     */
    private static evaluator(args: any[], options: Options): ValueWithError {
        let locale = options.locale ? options.locale : Intl.DateTimeFormat().resolvedOptions().locale;
        locale = FunctionUtils.determineLocale(args, 2, locale);
        return {
            value: (InternalFunctionUtils.parseStringOrUndefined(args[0]) as any).toLocaleLowerCase(locale),
            error: undefined,
        };
    }
}
