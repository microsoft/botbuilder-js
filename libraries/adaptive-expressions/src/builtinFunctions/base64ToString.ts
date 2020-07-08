/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

/**
 * Return the string version of a base64-encoded string, effectively decoding the base64 string.
 */
export class Base64ToString extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Base64ToString, Base64ToString.evaluator(), ReturnType.String, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: Readonly<any>): string => Buffer.from(args[0], 'base64').toString(), FunctionUtils.verifyString);
    }
}