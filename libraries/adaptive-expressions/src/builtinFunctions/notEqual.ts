/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { ComparisonEvaluator } from './comparisonEvaluator';

/**
 * Return true if the two items are not equal.
 */
export class NotEqual extends ComparisonEvaluator {
    /**
     * Initializes a new instance of the `NotEqual` class.
     */
    public constructor() {
        super(ExpressionType.NotEqual, NotEqual.func, FunctionUtils.validateBinary);
    }

    /**
     * @private
     */
    private static func(args: any[]): boolean {
        return !InternalFunctionUtils.isEqual(args);
    }
}
