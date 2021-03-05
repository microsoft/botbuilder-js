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
    public constructor() {
        super(ExpressionType.Divide, Divide.func, Divide.verify);
    }

    /**
     * @private
     */
    private static func(args: readonly unknown[]): number {
        return Math.floor((args[0] as number) / (args[1] as number));
    }

    /**
     * @private
     */
    private static verify(val: unknown, expression: Expression, pos: number): string {
        let error: string = FunctionUtils.verifyNumber(val, expression, pos);

        if (!error && pos > 0 && (val as number) === 0) {
            error = `Cannot divide by 0 from ${expression}`;
        }

        return error;
    }
}
