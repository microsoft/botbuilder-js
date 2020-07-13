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

/**
 * Remove leading and trailing whitespace from a string, and return the updated string.
 */
export class Trim extends StringTransformEvaluator {
    public constructor() {
        super(ExpressionType.Trim, Trim.evaluator);
    }

    private static evaluator(args: any[]): string {
        return String(FunctionUtils.parseStringOrNull(args[0])).trim();
    }
}