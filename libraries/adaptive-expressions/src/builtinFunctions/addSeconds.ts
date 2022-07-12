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
 * Add a number of seconds to a timestamp.
 */
export class AddSeconds extends TimeTransformEvaluator {
    /**
     * Initializes a new instance of the [AddSeconds](xref:adaptive-expressions.AddSeconds) class.
     */
    constructor() {
        super(
            ExpressionType.AddSeconds,
            (ts: Date, num: number): Date => {
                const newDate = new Date(ts);
                newDate.setSeconds(ts.getSeconds() + num);
                return newDate;
            }
        );
    }
}
