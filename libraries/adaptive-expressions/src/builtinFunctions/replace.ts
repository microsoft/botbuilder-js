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
 * Replace a substring with the specified string, and return the result string.
 * This function is case-sensitive.
 */
export class Replace extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
=======
    public constructor() {
>>>>>>> master
        super(ExpressionType.Replace, Replace.evaluator(), ReturnType.String, Replace.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((
            args: any[]): any => {
            let error = undefined;
            let result = undefined;
<<<<<<< HEAD
            if (FunctionUtils.parseStringOrNull(args[1]).length === 0) {
=======
            if (FunctionUtils.parseStringOrUndefined(args[1]).length === 0) {
>>>>>>> master
                error = `${args[1]} should be a string with length at least 1`;
            }

            if (!error) {
<<<<<<< HEAD
                result = FunctionUtils.parseStringOrNull(args[0]).split(FunctionUtils.parseStringOrNull(args[1])).join(FunctionUtils.parseStringOrNull(args[2]));
            }

            return {value: result, error};
=======
                result = FunctionUtils.parseStringOrUndefined(args[0]).split(FunctionUtils.parseStringOrUndefined(args[1])).join(FunctionUtils.parseStringOrUndefined(args[2]));
            }

            return { value: result, error };
>>>>>>> master
        }, FunctionUtils.verifyStringOrNull);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 3, 3, ReturnType.String);
    }
}