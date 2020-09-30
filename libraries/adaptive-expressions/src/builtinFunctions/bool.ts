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
 * Return the Boolean version of a value.
 */
export class Bool extends ComparisonEvaluator {
    /**
     * Initializes a new instance of the `Bool` class.
     */
    public constructor() {
        super(ExpressionType.Bool, Bool.func, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static func(args: any[]): boolean {
        return InternalFunctionUtils.isLogicTrue(args[0]);
    }
}
