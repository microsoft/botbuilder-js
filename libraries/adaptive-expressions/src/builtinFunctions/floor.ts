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
 * Returns the largest integer less than or equal to the specified number.
 */
export class Floor extends NumberTransformEvaluator {
    /**
     * Initializes a new instance of the [Floor](xref:adaptive-expressions.Floor) class.
     */
    constructor() {
        super(ExpressionType.Floor, Floor.func);
    }

    /**
     * @private
     */
    private static func(args: any[]): number {
        return Math.floor(args[0]);
    }
}
