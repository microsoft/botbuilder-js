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
    constructor() {
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
    private static func(args: any[]): boolean {
        if (
            (FunctionUtils.isNumber(args[0]) && FunctionUtils.isNumber(args[1])) ||
            (typeof args[0] === 'string' && typeof args[1] === 'string') ||
            (args[0] instanceof Date && args[1] instanceof Date)
        ) {
            return args[0] >= args[1];
        } else {
            throw new Error(`${args[0]} and ${args[1]} must be comparable.`);
        }
    }
}
