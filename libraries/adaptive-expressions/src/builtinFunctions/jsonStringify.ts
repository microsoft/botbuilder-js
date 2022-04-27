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
 * Return the string version of a value.
 */
export class JsonStringify extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [JsonStringify](xref:adaptive-expressions.JsonStringify) class.
     */
    constructor() {
        super(ExpressionType.JsonStringify, JsonStringify.evaluator(), ReturnType.String, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): string => {
            return JSON.stringify(args[0]);
        });
    }
}
