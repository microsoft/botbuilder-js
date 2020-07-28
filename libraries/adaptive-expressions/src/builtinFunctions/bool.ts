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
 * Return the Boolean version of a value.
 */
export class Bool extends ComparisonEvaluator {
    public constructor() {
        super(ExpressionType.Bool, Bool.func, FunctionUtils.validateUnary);
    }

    private static func(args: any[]): boolean {
        return FunctionUtils.isLogicTrue(args[0]);
    }
}