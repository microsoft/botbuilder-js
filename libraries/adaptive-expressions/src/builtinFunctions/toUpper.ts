/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { StringTransformEvaluator } from './stringTransformEvaluator';

/**
 * Return a string in uppercase format.
 * If a character in the string doesn't have an uppercase version, that character stays unchanged in the returned string.
 */
export class ToUpper extends StringTransformEvaluator {
    public constructor() {
        super(ExpressionType.ToUpper, ToUpper.evaluator);
    }

    private static evaluator(args: any[]): string {
        return String(FunctionUtils.parseStringOrUndefined(args[0])).toUpperCase();
    }
}