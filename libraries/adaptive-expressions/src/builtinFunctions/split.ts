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
 * Return an array that contains substrings, separated by commas, based on the specified delimiter character in the original string.
 */
export class Split extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
=======
    public constructor() {
>>>>>>> master
        super(ExpressionType.Split, Split.evaluator(), ReturnType.Array, Split.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
<<<<<<< HEAD
        return FunctionUtils.apply((args: any[]): string[] => FunctionUtils.parseStringOrNull(args[0]).split(FunctionUtils.parseStringOrNull(args[1] || '')), FunctionUtils.verifyStringOrNull);
=======
        return FunctionUtils.apply((args: any[]): string[] => FunctionUtils.parseStringOrUndefined(args[0]).split(FunctionUtils.parseStringOrUndefined(args[1] || '')), FunctionUtils.verifyStringOrNull);
>>>>>>> master
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, 2, ReturnType.String);
    }
}