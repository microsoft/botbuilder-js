/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { FunctionUtils } from '../functionUtils';
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
        super(ExpressionType.TitleCase, TitleCase.evaluator, FunctionUtils.validateUnaryOrBinaryString);
    }

    private static evaluator(args: readonly unknown[], options: Options): string {
        let locale = options.locale ? options.locale : Intl.DateTimeFormat().resolvedOptions().locale;
        locale = FunctionUtils.determineLocale(args, 2, locale);
        const firstArg = args[0];
        if (typeof firstArg === 'string' || firstArg === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const inputStr = (InternalFunctionUtils.parseStringOrUndefined(firstArg) as any).toLocaleLowerCase(locale);
            if (inputStr === '') {
                return inputStr;
            } else {
                return inputStr.replace(
                    /\w\S*/g,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (txt): string => txt.charAt(0).toUpperCase() + (txt.substr(1) as any).toLocaleLowerCase(locale)
                );
            }
        }
    }
}
