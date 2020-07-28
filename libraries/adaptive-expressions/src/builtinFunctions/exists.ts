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
 * Evaluates an expression for truthiness.
 */
export class Exists extends ComparisonEvaluator {
    public constructor() {
        super(ExpressionType.Exists, Exists.func, FunctionUtils.validateUnary, FunctionUtils.verifyNotNull);
    }

    private static func(args: any[]): boolean {
        return args[0] !== undefined && args[0] !== null;
    }
}