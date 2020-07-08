/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ReturnType } from '../expression';
import { FunctionUtils } from '../functionUtils';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';

export class NumericEvaluator extends ExpressionEvaluator {
    public constructor(type: string, func: (args: any[]) => any) {
        super(type, NumericEvaluator.evaluator(func), ReturnType.Number, FunctionUtils.validateNumber);
    }

    private static evaluator(func: (args: any[]) => any): EvaluateExpressionDelegate {
        return FunctionUtils.applySequence(func, FunctionUtils.verifyNumber);
    }
}