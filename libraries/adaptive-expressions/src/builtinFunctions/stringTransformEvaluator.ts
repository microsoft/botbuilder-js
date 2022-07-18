/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '..';
import { ExpressionEvaluator } from '../expressionEvaluator';
import { FunctionUtils } from '../functionUtils';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Evaluator that transforms a string to another string.
 */
export class StringTransformEvaluator extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [StringTransformEvaluator](xref:adaptive-expressions.StringTransformEvaluator) class.
     *
     * @param type Name of the built-in function.
     * @param func The string transformation function, it takes a list of objects and returns an string.
     * @param validator The validation function.
     */
    constructor(type: string, func: (arg0: any[], options: Options) => string, validator?: (expr: Expression) => void) {
        super(
            type,
            FunctionUtils.applyWithOptions(func, FunctionUtils.verifyStringOrNull),
            ReturnType.String,
            validator ? validator : FunctionUtils.validateUnaryString
        );
    }
}
