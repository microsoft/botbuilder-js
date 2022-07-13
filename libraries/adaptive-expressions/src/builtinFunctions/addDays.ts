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
 * Add a number of days to a timestamp.
 */
export class AddDays extends TimeTransformEvaluator {
    /**
     * Initializes a new instance of the [AddDays](xref:adaptive-expressions.AddDays) class.
     */
    constructor() {
        super(
            ExpressionType.AddDays,
            (ts: Date, num: number): Date => {
                const newDate = new Date(ts);
                newDate.setDate(ts.getDate() + num);
                return newDate;
            }
        );
    }
}
