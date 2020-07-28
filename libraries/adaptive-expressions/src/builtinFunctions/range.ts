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

/**
 * Return an integer array that starts from a specified integer.
 */
export class Range extends ExpressionEvaluator {
    public constructor(){
=======
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Return an integer array that starts from a specified integer with the given length.
 */
export class Range extends ExpressionEvaluator {
    public constructor() {
>>>>>>> master
        super(ExpressionType.Range, Range.evaluator(), ReturnType.Array, FunctionUtils.validateBinaryNumber);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => {
                let error: string;
                if (args[1] <= 0) {
                    error = 'Second paramter must be more than zero';
                }

                const result: number[] = [...Array(args[1]).keys()].map((u: number): number => u + Number(args[0]));

<<<<<<< HEAD
                return {value: result, error};
=======
                return { value: result, error };
>>>>>>> master
            },
            FunctionUtils.verifyInteger
        );
    }
}