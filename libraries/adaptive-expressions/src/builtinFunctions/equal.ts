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
 * Check whether both values, expressions, or objects are equivalent.
 * Return true if both are equivalent, or return false if they're not equivalent.
 */
export class Equal extends ComparisonEvaluator {
    public constructor() {
        super(ExpressionType.Equal, FunctionUtils.isEqual, FunctionUtils.validateBinary);
    }
}