/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator } from '../expressionEvaluator';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../expression';

/**
 * Evaluator that transforms a string to another string.
 */
export class StringTransformEvaluator extends ExpressionEvaluator {
    public constructor(type: string, func: (arg0: any[]) => string) {
        super(type, FunctionUtils.apply(func, FunctionUtils.verifyStringOrNull),
            ReturnType.String, FunctionUtils.validateUnaryString);
    }
}