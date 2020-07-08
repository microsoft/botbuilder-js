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
 * Return the binary array of a base64-encoded string.
 */
export class Base64ToBinary extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Base64ToBinary, Base64ToBinary.evaluator(), ReturnType.Object, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: Readonly<any>): Uint8Array => {
                const raw = atob(args[0].toString());
                return FunctionUtils.toBinary(raw);
            }, FunctionUtils.verifyString);
    }
}