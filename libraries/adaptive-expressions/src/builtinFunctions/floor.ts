/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

<<<<<<< HEAD
import { NumberTransformEvaluator } from './numberTransformEvaluator';
import { ExpressionType } from '../expressionType';
=======
import { ExpressionType } from '../expressionType';
import { NumberTransformEvaluator } from './numberTransformEvaluator';
>>>>>>> master

/**
 * Returns the largest integer less than or equal to the specified number.
 */
export class Floor extends NumberTransformEvaluator {
<<<<<<< HEAD
    public constructor(){
=======
    public constructor() {
>>>>>>> master
        super(ExpressionType.Floor, Floor.func);
    }

    private static func(args: any[]): number {
        return Math.floor(args[0]);
    }
}