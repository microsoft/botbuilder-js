/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionType } from '../expressionType';
import { NumberTransformEvaluator } from './numberTransformEvaluator';

/**
 * Returns the smallest integral value that is greater than or equal to the specified number.
 */
export class Ceiling extends NumberTransformEvaluator {
    /**
     * Initializes a new instance of the [Ceiling](xref:adaptive-expressions.Ceiling) class.
     */
    constructor() {
        super(ExpressionType.Ceiling, Ceiling.func);
    }

    /**
     * @private
     */
    private static func(args: any[]): number {
        return Math.ceil(args[0]);
    }
}
