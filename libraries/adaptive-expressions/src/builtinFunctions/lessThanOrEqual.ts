/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

<<<<<<< HEAD
import { ComparisonEvaluator } from './comparisonEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
=======
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ComparisonEvaluator } from './comparisonEvaluator';
>>>>>>> master

/**
 * Check whether the first value is less than or equal to the second value.
 * Return true if the first value is less than or equal, or return false if the first value is more.
 */
export class LessThanOrEqual extends ComparisonEvaluator {
    public constructor() {
        super(ExpressionType.LessThanOrEqual, LessThanOrEqual.func, FunctionUtils.validateBinaryNumberOrString, FunctionUtils.verifyNumberOrString);
    }

    private static func(args: any[]): boolean {
        return args[0] <= args[1];
    }
}