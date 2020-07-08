/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TimeTransformEvaluator } from './timeTransformEvaluator';
import moment from 'moment';
import { ExpressionType } from '../expressionType';

export class AddHours extends TimeTransformEvaluator {
    public constructor() {
        super(ExpressionType.AddHours, (ts: Date, num: any): Date => moment(ts).utc().add(num, 'h').toDate());
    }
}