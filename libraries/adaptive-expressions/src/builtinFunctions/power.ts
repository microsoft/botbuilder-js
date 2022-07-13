/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MultivariateNumericEvaluator } from './multivariateNumericEvaluator';

/**
 * Return exponentiation of one number to another.
 */
export class Power extends MultivariateNumericEvaluator {
    /**
     * Initializes a new instance of the [Power](xref:adaptive-expressions.Power) class.
     */
    constructor() {
        super(ExpressionType.Power, Power.func, FunctionUtils.verifyNumberOrNumericList);
    }

    /**
     * @private
     */
    private static func(args: any[]): number {
        return Math.pow(args[0], args[1]);
    }
}
