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
import atob from 'atob-lite';

/**
 * Return the string version of a base64-encoded string, effectively decoding the base64 string.
 */
export class Base64ToString extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Base64ToString](xref:adaptive-expressions.Base64ToString) class.
     */
    constructor() {
        super(
            ExpressionType.Base64ToString,
            Base64ToString.evaluator(),
            ReturnType.String,
            FunctionUtils.validateUnary
        );
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: Readonly<any>): string => atob(args[0]), FunctionUtils.verifyString);
    }
}
