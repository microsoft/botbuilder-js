/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { ReturnType } from '../returnType';

/**
 * Sort elements in the collection in descending order, and return the sorted collection.
 */
export class SortByDescending extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [SortByDescending](xref:adaptive-expressions.SortByDescending) class.
     */
    constructor() {
        super(
            ExpressionType.SortByDescending,
            InternalFunctionUtils.sortBy(true),
            ReturnType.Array,
            SortByDescending.validator
        );
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.Array);
    }
}
