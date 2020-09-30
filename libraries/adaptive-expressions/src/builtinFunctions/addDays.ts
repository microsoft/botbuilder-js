/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import moment from 'moment';

import { ExpressionType } from '../expressionType';
import { TimeTransformEvaluator } from './timeTransformEvaluator';

/**
 * Add a number of days to a timestamp.
 */
export class AddDays extends TimeTransformEvaluator {

    /**
     * Initializes a new instance of the AddDays class.
     */
    public constructor() {
        super(ExpressionType.AddDays, (ts: Date, num: any): Date => moment(ts).utc().add(num, 'd').toDate());
    }
}
