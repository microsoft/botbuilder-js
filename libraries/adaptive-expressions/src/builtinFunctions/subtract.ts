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
    /**
     * Initializes a new instance of the [Subtract](xref:adaptive-expressions.Subtract) class.
     */
    constructor() {
        super(ExpressionType.Subtract, Subtract.func);
    }

    /**
     * @private
     */
    private static func(args: any[]): number {
        return Number(args[0]) - Number(args[1]);
    }
}
