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
 * Check whether the first value is greater than or equal to the second value. Return true when the first value is greater or equal,
 * or return false if the first value is less.
 */
export class GreaterThanOrEqual extends ComparisonEvaluator {

    /**
     * Initializes a new instance of the GreaterThanOrEqual class.
     */
    public constructor() {
        super(ExpressionType.GreaterThanOrEqual, GreaterThanOrEqual.func, FunctionUtils.validateBinaryNumberOrString, FunctionUtils.verifyNumberOrString);
    }

    /**
     * @private
     */
    private static func(args: any[]): boolean {
        return args[0] >= args[1];
    }
}
