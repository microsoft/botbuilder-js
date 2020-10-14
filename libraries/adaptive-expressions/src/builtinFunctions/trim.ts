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
 * Remove leading and trailing whitespace from a string, and return the updated string.
 */
export class Trim extends StringTransformEvaluator {
    public constructor() {
        super(ExpressionType.Trim, Trim.evaluator);
    }

    private static evaluator(args: any[]): string {
        return String(InternalFunctionUtils.parseStringOrUndefined(args[0])).trim();
    }
}
