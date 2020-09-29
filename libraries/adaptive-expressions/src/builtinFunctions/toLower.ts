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
import { StringTransformEvaluator } from './stringTransformEvaluator';

/**
 * Return a string in lowercase format.
 * If a character in the string doesn't have a lowercase version, that character stays unchanged in the returned string.
 */
export class ToLower extends StringTransformEvaluator {
    public constructor() {
        super(ExpressionType.ToLower, ToLower.evaluator);
    }

    private static evaluator(args: any[]): string {
        return String(InternalFunctionUtils.parseStringOrUndefined(args[0])).toLowerCase();
    }
}