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
import { InternalFunctionUtils } from '../functionUtils.internal';
import { ReturnType } from '../returnType';

import atob from 'atob-lite';

/**
 * Return the binary array of a base64-encoded string.
 */
export class Base64ToBinary extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Base64ToBinary](xref:adaptive-expressions.Base64ToBinary) class.
     */
    constructor() {
        super(
            ExpressionType.Base64ToBinary,
            Base64ToBinary.evaluator(),
            ReturnType.Object,
            FunctionUtils.validateUnary
        );
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: Readonly<any>): Uint8Array => {
            const raw = atob(args[0].toString());
            return InternalFunctionUtils.getTextEncoder().encode(raw);
        }, FunctionUtils.verifyString);
    }
}
