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

export class NumberTransformEvaluator extends ExpressionEvaluator {
    public constructor(type: string, func: (args: any[]) => number) {
        super(type, NumberTransformEvaluator.evaluator(func), ReturnType.Number, FunctionUtils.validateUnaryNumber);
    }

    private static evaluator(func: (args: any[]) => number): EvaluateExpressionDelegate {
        return FunctionUtils.apply(func, FunctionUtils.verifyNumber);
    }
}