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
 * Return the result from subtracting the next number from the previous number.
 */
export class Subtract extends MultivariateNumericEvaluator {
    public constructor() {
        super(ExpressionType.Subtract, Subtract.func);
    }

    private static func(args: any[]): number {
        return Number(args[0]) - Number(args[1]);
    }
}