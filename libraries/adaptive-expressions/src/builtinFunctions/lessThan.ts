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
 * Check whether the first value is less than the second value.
 * Return true if the first value is less, or return false if the first value is more.
 */
export class LessThan extends ComparisonEvaluator {
    /**
     * Initializes a new instance of the [LessThan](xref:adaptive-expressions.LessThan) class.
     */
    public constructor() {
        super(ExpressionType.LessThan, LessThan.func, FunctionUtils.validateBinary, FunctionUtils.verifyNotNull);
    }

    /**
     * @private
     */
    private static func(args: readonly unknown[]): boolean {
        const firstChild = args[0];
        const secondChild = args[1];
        if (
            (FunctionUtils.isNumber(firstChild) && FunctionUtils.isNumber(secondChild)) ||
            (typeof firstChild === 'string' && typeof secondChild === 'string') ||
            (firstChild instanceof Date && secondChild instanceof Date)
        ) {
            return firstChild < secondChild;
        } else {
            throw new Error(`${firstChild} and ${secondChild} must be comparable.`);
        }
    }
}
