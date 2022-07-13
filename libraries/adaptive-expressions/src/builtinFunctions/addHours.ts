/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionType } from '../expressionType';
import { TimeTransformEvaluator } from './timeTransformEvaluator';

/**
 * Add a number of hours to a timestamp.
 */
export class AddHours extends TimeTransformEvaluator {
    /**
     * Initializes a new instance of the [AddHours](xref:adaptive-expressions.AddHours) class.
     */
    constructor() {
        super(
            ExpressionType.AddHours,
            (ts: Date, num: number): Date => {
                const newDate = new Date(ts);
                newDate.setHours(ts.getHours() + num);
                return newDate;
            }
        );
    }
}
