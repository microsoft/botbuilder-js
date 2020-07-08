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

export class Foreach extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Foreach, FunctionUtils.foreach, ReturnType.Array, FunctionUtils.validateForeach);
    }
}