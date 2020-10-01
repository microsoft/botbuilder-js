/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator } from '../expressionEvaluator';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Evaluator that transforms a string to another string.
 */
export class StringTransformEvaluator extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the `StringTransformEvaluator` class.
     * @param type Name of the built-in function.
     * @param func The string transformation function, it takes a list of objects and returns an string.
     */
    public constructor(type: string, func: (arg0: any[]) => string) {
        super(
            type,
            FunctionUtils.apply(func, FunctionUtils.verifyStringOrNull),
            ReturnType.String,
            FunctionUtils.validateUnaryString
        );
    }
}
