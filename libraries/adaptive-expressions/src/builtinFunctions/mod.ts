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
 * Return the remainder from dividing two numbers. 
 */
export class Mod extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
=======
    public constructor() {
>>>>>>> master
        super(ExpressionType.Mod, Mod.evaluator(), ReturnType.Number, FunctionUtils.validateBinaryNumber);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => {
                let error: string;
                let value: any;
                if (Number(args[1]) === 0) {
                    error = (`Cannot mod by 0.`);
                } else {
                    value = args[0] % args[1];
                }

<<<<<<< HEAD
                return {value, error};
=======
                return { value, error };
>>>>>>> master
            },
            FunctionUtils.verifyInteger);
    }
}