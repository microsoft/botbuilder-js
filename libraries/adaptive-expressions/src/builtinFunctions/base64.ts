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
import btoa = require('btoa-lite');

/**
 * Return the base64-encoded version of a string or byte array.
 */
export class Base64 extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Base64](xref:adaptive-expressions.Base64) class.
     */
    public constructor() {
        super(ExpressionType.Base64, Base64.evaluator(), ReturnType.String, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: Readonly<any>): string | Uint8Array => {
            let result: string;
            if (typeof args[0] === 'string' || args[0] instanceof Uint8Array) {
                result = btoa(args[0]);
            }

            return result;
        });
    }
}
