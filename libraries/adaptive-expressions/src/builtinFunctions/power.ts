/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

<<<<<<< HEAD
import { MultivariateNumericEvaluator } from './multivariateNumericEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
=======
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MultivariateNumericEvaluator } from './multivariateNumericEvaluator';
>>>>>>> master

/**
 * Return exponentiation of one number to another.
 */
export class Power extends MultivariateNumericEvaluator {
    public constructor() {
        super(ExpressionType.Power, Power.func, FunctionUtils.verifyNumberOrNumericList);
    }

    private static func(args: any[]): number {
        return Math.pow(args[0], args[1]);
    }
}