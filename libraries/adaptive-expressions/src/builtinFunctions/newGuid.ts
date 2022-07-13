/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { v4 as uuidv4 } from 'uuid';
import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Return a new Guid string.
 */
export class NewGuid extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [NewGuid](xref:adaptive-expressions.NewGuid) class.
     */
    constructor() {
        super(ExpressionType.NewGuid, NewGuid.evaluator(), ReturnType.String, NewGuid.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((): string => NewGuid.evalNewGuid());
    }

    /**
     * @private
     */
    private static evalNewGuid(): string {
        return uuidv4();
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 0, 0);
    }
}
