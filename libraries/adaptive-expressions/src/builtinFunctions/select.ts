/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { ReturnType } from '../returnType';

/**
 * Operate on each element and return the new collection of transformed elements.
 */
export class Select extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Select](xref:adaptive-expressions.Select) class.
     */
    constructor() {
        super(
            ExpressionType.Select,
            InternalFunctionUtils.foreach,
            ReturnType.Array,
            InternalFunctionUtils.ValidateLambdaExpression
        );
    }
}
