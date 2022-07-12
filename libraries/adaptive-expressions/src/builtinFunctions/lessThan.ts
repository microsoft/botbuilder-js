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
    constructor() {
        super(ExpressionType.LessThan, LessThan.func, FunctionUtils.validateBinary, FunctionUtils.verifyNotNull);
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
            return args[0] < args[1];
        } else {
            throw new Error(`${args[0]} and ${args[1]} must be comparable.`);
        }
    }
}
