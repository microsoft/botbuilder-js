/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionType } from '../expressionType';
import { NumberTransformEvaluator } from './numberTransformEvaluator';

/**
 * Returns the absolute value of the specified number.
 */
export class Abs extends NumberTransformEvaluator {
    /**
     * Initializes a new instance of the [Floor](xref:adaptive-expressions.Abs) class.
     */
    constructor() {
        super(ExpressionType.Abs, Abs.func);
    }

    /**
     * @private
     */
    private static func(args: any[]): number {
        return Math.abs(args[0]);
    }
}
