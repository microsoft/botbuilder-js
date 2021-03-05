/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionType } from '../expressionType';
import { MultivariateNumericEvaluator } from './multivariateNumericEvaluator';

/**
 * Return the product from multiplying any number of numbers.
 */
export class Multiply extends MultivariateNumericEvaluator {
    /**
     * Initializes a new instance of the [Multiply](xref:adaptive-expressions.Multiply) class.
     */
    public constructor() {
        super(ExpressionType.Multiply, Multiply.func);
    }

    /**
     * @private
     */
    private static func(args: readonly unknown[]): number {
        return (args[0] as number) * (args[1] as number);
    }
}
