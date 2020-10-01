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
    public constructor() {
        super(ExpressionType.Multiply, Multiply.func);
    }

    private static func(args: any[]): number {
        return Number(args[0]) * Number(args[1]);
    }
}
