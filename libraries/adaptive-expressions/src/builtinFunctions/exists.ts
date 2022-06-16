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
 * Evaluates an expression for truthiness.
 */
export class Exists extends ComparisonEvaluator {
    /**
     * Initializes a new instance of the [Exists](xref:adaptive-expressions.Exists) class.
     */
    constructor() {
        super(ExpressionType.Exists, Exists.func, FunctionUtils.validateUnary, FunctionUtils.verifyNotNull);
    }

    /**
     * @private
     */
    private static func(args: any[]): boolean {
        return args[0] != null;
    }
}
