/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

<<<<<<< HEAD
import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType } from '../returnType';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
=======
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';
>>>>>>> master

/**
 * Return the number of words in a string.
 */
export class CountWord extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
=======
    public constructor() {
>>>>>>> master
        super(ExpressionType.CountWord, CountWord.evaluator(), ReturnType.Number, FunctionUtils.validateUnaryString);
    }

    private static evaluator(): EvaluateExpressionDelegate {
<<<<<<< HEAD
        return FunctionUtils.apply((args: any[]): number => FunctionUtils.parseStringOrNull(args[0]).trim().split(/\s+/).length, FunctionUtils.verifyStringOrNull);
=======
        return FunctionUtils.apply((args: any[]): number => FunctionUtils.parseStringOrUndefined(args[0]).trim().split(/\s+/).length, FunctionUtils.verifyStringOrNull);
>>>>>>> master
    }
}