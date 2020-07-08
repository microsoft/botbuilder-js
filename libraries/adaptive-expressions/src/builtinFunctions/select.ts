/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator } from '../expressionEvaluator';
import { ReturnType } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class Select extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Select, FunctionUtils.foreach, ReturnType.Array, FunctionUtils.validateForeach);
    }
}