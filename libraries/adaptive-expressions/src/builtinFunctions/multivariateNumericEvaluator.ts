/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { VerifyExpression, FunctionUtils } from '../functionUtils';
import { ReturnType } from '../expression';

export class MultivariateNumericEvaluator extends ExpressionEvaluator {
    public constructor(type: string, func: (args: any[]) => number, verify?: VerifyExpression) {
        super(type, MultivariateNumericEvaluator.evaluator(func, verify), ReturnType.Number, FunctionUtils.validateTwoOrMoreThanTwoNumbers);
    }

    private static evaluator(func: (args: any[]) => number, verify?: VerifyExpression): EvaluateExpressionDelegate  {
        return FunctionUtils.applySequence(func, verify || FunctionUtils.verifyNumber);
    }
}