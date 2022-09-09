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
     * Initializes a new instance of the [Bool](xref:adaptive-expressions.Bool) class.
     */
    constructor() {
        super(ExpressionType.Bool, Bool.func, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static func(args: any[]): boolean {
        if (FunctionUtils.isNumber(args[0])) {
            return args[0] !== 0;
        }

        if (/false/i.test(args[0])) {
            return false;
        }

        return InternalFunctionUtils.isLogicTrue(args[0]);
    }
}
