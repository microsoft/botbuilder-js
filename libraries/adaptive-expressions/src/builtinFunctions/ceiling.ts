/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { NumberTransformEvaluator } from './numberTransformEvaluator';
import { ExpressionType } from '../expressionType';

export class Ceiling extends NumberTransformEvaluator {
    public constructor(){
        super(ExpressionType.Ceiling, Ceiling.func);
    }

    private static func(args: any[]): number {
        return Math.ceil(args[0]);
    }
}