/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

<<<<<<< HEAD
import { TimeTransformEvaluator } from './timeTransformEvaluator';
import moment from 'moment';
import { ExpressionType } from '../expressionType';
=======
import moment from 'moment';

import { ExpressionType } from '../expressionType';
import { TimeTransformEvaluator } from './timeTransformEvaluator';
>>>>>>> master

/**
 * Add a number of minutes to a timestamp.
 */
export class AddMinutes extends TimeTransformEvaluator {
    public constructor() {
        super(ExpressionType.AddMinutes, (ts: Date, num: any): Date => moment(ts).utc().add(num, 'minutes').toDate());
    }
}