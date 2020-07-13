/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { MultivariateNumericEvaluator } from './multivariateNumericEvaluator';
import { ExpressionType } from '../expressionType';

/**
 * Return the result from subtracting the second number from the first number.
 */
export class Subtract extends MultivariateNumericEvaluator {
    public constructor() {
        super(ExpressionType.Subtract, Subtract.func);
    }

    private static func(args: any[]): number {
        return Number(args[0]) - Number(args[1]);
    }
}