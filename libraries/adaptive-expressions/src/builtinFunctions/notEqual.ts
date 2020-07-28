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

/**
 * return true if the two items are not equal.
=======
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ComparisonEvaluator } from './comparisonEvaluator';

/**
 * Return true if the two items are not equal.
>>>>>>> master
 */
export class NotEqual extends ComparisonEvaluator {
    public constructor() {
        super(ExpressionType.NotEqual, NotEqual.func, FunctionUtils.validateBinary);
    }

    private static func(args: any[]): boolean {
        return !FunctionUtils.isEqual(args);
    }
}