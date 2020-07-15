/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MultivariateNumericEvaluator } from './multivariateNumericEvaluator';

/**
 * Return the integer result from dividing two numbers. 
 */
export class Divide extends MultivariateNumericEvaluator {
    public constructor() {
        super(ExpressionType.Divide, Divide.func, Divide.verify);
    }

    private static func(args: any[]): number {
        return Math.floor(Number(args[0]) / Number(args[1]));
    }

    private static verify(val: any, expression: Expression, pos: number): string {
        let error: string = FunctionUtils.verifyNumber(val, expression, pos);
        if (!error && (pos > 0 && Number(val) === 0)) {
            error = `Cannot divide by 0 from ${expression}`;
        }

        return error;
    }
}