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
 * Return true if a given input is a UTC ISO format (YYYY-MM-DDTHH:mm:ss.fffZ) timestamp string.
 */
export class IsDateTime extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
=======
    public constructor() {
>>>>>>> master
        super(ExpressionType.IsDateTime, IsDateTime.evaluator(), ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): boolean => typeof args[0] === 'string' && FunctionUtils.verifyISOTimestamp(args[0]) === undefined);
    }
}