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

export class Mod extends ExpressionEvaluator {
    public constructor(){
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

                return {value, error};
            },
            FunctionUtils.verifyInteger);
    }
}