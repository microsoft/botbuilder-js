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
    /**
     * Initializes a new instance of the [Divide](xref:adaptive-expressions.Divide) class.
     */
    constructor() {
        super(ExpressionType.Divide, Divide.func, Divide.verify);
    }

    /**
     * @private
     */
    private static func(args: any[]): number {
        const result: number = Number(args[0]) / Number(args[1]);
        if (Number.isInteger(args[0]) && Number.isInteger(args[1])) {
            return Math.floor(result);
        }
        return result;
    }

    /**
     * @private
     */
    private static verify(val: any, expression: Expression, pos: number): string {
        let error: string = FunctionUtils.verifyNumber(val, expression, pos);

        if (!error && pos > 0 && Number(val) === 0) {
            error = `Cannot divide by 0 from ${expression}`;
        }

        return error;
    }
}
