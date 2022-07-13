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
 * Return the length of a string.
 */
export class Length extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Length](xref:adaptive-expressions.Length) class.
     */
    constructor() {
        super(ExpressionType.Length, Length.evaluator(), ReturnType.Number, FunctionUtils.validateUnaryString);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): number => InternalFunctionUtils.parseStringOrUndefined(args[0]).length,
            FunctionUtils.verifyStringOrNull
        );
    }
}
