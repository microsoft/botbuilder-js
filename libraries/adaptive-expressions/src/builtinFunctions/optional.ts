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
import { ReturnType } from '../returnType';

/**
 * For the MostSpecificSelector, this is a short hand so that instead of having to do A &amp; B || A you can do A &amp; optional(B) to mean the same thing.
 */
export class Optional extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Optional](xref:adaptive-expressions.Optional) class.
     */
    constructor() {
        super(ExpressionType.Optional, Optional.evaluator(), ReturnType.Boolean, FunctionUtils.validateUnaryBoolean);
        this.negation = this;
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return undefined;
    }
}
