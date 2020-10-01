/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { ReturnType } from '../returnType';

/**
 * Return the number of words in a string.
 */
export class CountWord extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.CountWord, CountWord.evaluator(), ReturnType.Number, FunctionUtils.validateUnaryString);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): number => InternalFunctionUtils.parseStringOrUndefined(args[0]).trim().split(/\s+/).length,
            FunctionUtils.verifyStringOrNull
        );
    }
}
