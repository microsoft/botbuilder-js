/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ComparisonEvaluator } from './comparisonEvaluator';

/**
 * Check whether the first value is greater than the second value.
 * Return true if the first value is more, or return false if less.
 */
export class GreaterThan extends ComparisonEvaluator {

    /**
     * Initializes a new instance of the GreaterThan class.
     */
    public constructor() {
        super(ExpressionType.GreaterThan, GreaterThan.func, FunctionUtils.validateBinaryNumberOrString, FunctionUtils.verifyNumberOrString);
    }

    /**
     * @private
     */
    private static func(args: any[]): boolean {
        return args[0] > args[1];
    }
}
