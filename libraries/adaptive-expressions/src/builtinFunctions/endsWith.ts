/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

<<<<<<< HEAD
import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { Expression } from '../expression';
import { ReturnType } from '../returnType';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
=======
import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';
>>>>>>> master

/**
 * Check whether a string ends with a specific substring. Return true if the substring is found, or return false if not found.
 * This function is case-insensitive.
 */
export class EndsWith extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
=======
    public constructor() {
>>>>>>> master
        super(ExpressionType.EndsWith, EndsWith.evaluator(), ReturnType.Boolean, EndsWith.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
<<<<<<< HEAD
        return FunctionUtils.apply((args: any[]): boolean => FunctionUtils.parseStringOrNull(args[0]).endsWith(FunctionUtils.parseStringOrNull(args[1])), FunctionUtils.verifyStringOrNull);
=======
        return FunctionUtils.apply((args: any[]): boolean => FunctionUtils.parseStringOrUndefined(args[0]).endsWith(FunctionUtils.parseStringOrUndefined(args[1])), FunctionUtils.verifyStringOrNull);
>>>>>>> master
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, 2, ReturnType.String);
    }
}