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
     * Initializes a new instance of the [GreaterThanOrEqual](xref:adaptive-expressions.GreaterThanOrEqual) class.
     */
    public constructor() {
        super(
            ExpressionType.GreaterThanOrEqual,
            GreaterThanOrEqual.func,
            FunctionUtils.validateBinary,
            FunctionUtils.verifyNotNull
        );
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
            return firstChild >= secondChild;
        } else {
            throw new Error(`${firstChild} and ${secondChild} must be comparable.`);
        }
    }
}
