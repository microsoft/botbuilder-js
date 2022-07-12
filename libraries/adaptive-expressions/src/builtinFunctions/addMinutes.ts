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
 * Add a number of minutes to a timestamp.
 */
export class AddMinutes extends TimeTransformEvaluator {
    /**
     * Initializes a new instance of the [AddMinutes](xref:adaptive-expressions.AddMinutes) class.
     */
    constructor() {
        super(
            ExpressionType.AddMinutes,
            (ts: Date, num: number): Date => {
                const newDate = new Date(ts);
                newDate.setMinutes(ts.getMinutes() + num);
                return newDate;
            }
        );
    }
}
