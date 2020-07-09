/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator } from '../expressionEvaluator';
import { ReturnType } from '../returnType';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

/**
 * Operate on each element and return the new collection of transformed elements.
 */
export class Select extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Select, FunctionUtils.foreach, ReturnType.Array, FunctionUtils.validateForeach);
    }
}