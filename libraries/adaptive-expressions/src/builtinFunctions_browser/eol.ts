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
 * Return the ordinal number of the input number.
 */
export class EOL extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.EOL, EOL.evaluator(), ReturnType.String, EOL.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((): string => {
            if (navigator.platform.includes('Win')) {
                return '\r\n';
            } else {
                return '\n';
            }
        });
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 0, 0);
    }
}