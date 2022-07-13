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
    /**
     * Initializes a new instance of the [Equal](xref:adaptive-expressions.Equal) class.
     */
    constructor() {
        super(
            ExpressionType.Equal,
            (args) => FunctionUtils.commonEquals(args[0], args[1]),
            FunctionUtils.validateBinary
        );
    }
}
