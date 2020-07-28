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
 * Return a random integer from a specified range, which is inclusive only at the starting end.
 */
export class Rand extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
=======
    public constructor() {
>>>>>>> master
        super(ExpressionType.Rand, Rand.evaluator(), ReturnType.Number, FunctionUtils.validateBinaryNumber);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => {
                let error: string;
                if (args[0] > args[1]) {
                    error = `Min value ${args[0]} cannot be greater than max value ${args[1]}.`;
                }

                const value: any = Math.floor(Math.random() * (Number(args[1]) - Number(args[0])) + Number(args[0]));

<<<<<<< HEAD
                return {value, error};
=======
                return { value, error };
>>>>>>> master
            },
            FunctionUtils.verifyInteger);
    }
}