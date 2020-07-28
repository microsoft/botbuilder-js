/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

<<<<<<< HEAD
import { StringTransformEvaluator } from './stringTransformEvaluator';
import { FunctionUtils } from '../functionUtils';
import { ExpressionType } from '../expressionType';
=======
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { StringTransformEvaluator } from './stringTransformEvaluator';
>>>>>>> master

/**
 * Remove leading and trailing whitespace from a string, and return the updated string.
 */
export class Trim extends StringTransformEvaluator {
    public constructor() {
        super(ExpressionType.Trim, Trim.evaluator);
    }

    private static evaluator(args: any[]): string {
<<<<<<< HEAD
        return String(FunctionUtils.parseStringOrNull(args[0])).trim();
=======
        return String(FunctionUtils.parseStringOrUndefined(args[0])).trim();
>>>>>>> master
    }
}