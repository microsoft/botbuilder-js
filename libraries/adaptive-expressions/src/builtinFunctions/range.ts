/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class Range extends ExpressionEvaluator {
    public constructor(){
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

                return {value: result, error};
            },
            FunctionUtils.verifyInteger
        );
    }
}