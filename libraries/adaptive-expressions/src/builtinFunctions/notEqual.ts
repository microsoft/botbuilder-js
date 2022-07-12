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
 * Return true if the two items are not equal.
 */
export class NotEqual extends ComparisonEvaluator {
    /**
     * Initializes a new instance of the [NotEqual](xref:adaptive-expressions.NotEqual) class.
     */
    constructor() {
        super(
            ExpressionType.NotEqual,
            (args) => !FunctionUtils.commonEquals(args[0], args[1]),
            FunctionUtils.validateBinary
        );
    }
}
