/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Return the length of a string.
 */
export class Length extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.Length, Length.evaluator(), ReturnType.Number, FunctionUtils.validateUnaryString);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): number => (FunctionUtils.parseStringOrUndefined(args[0])).length, FunctionUtils.verifyStringOrNull);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 0, 0);
    }
}
