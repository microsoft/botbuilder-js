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
import btoa from 'btoa-lite';
import { InternalFunctionUtils } from '../functionUtils.internal';

/**
 * Return the base64-encoded version of a string or byte array.
 */
export class Base64 extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Base64](xref:adaptive-expressions.Base64) class.
     */
    constructor() {
        super(ExpressionType.Base64, Base64.evaluator(), ReturnType.String, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: Readonly<any>): string | Uint8Array => {
            let result: string;
            const firstChild = args[0];
            if (typeof firstChild === 'string') {
                result = btoa(firstChild);
            }

            if (firstChild instanceof Uint8Array) {
                const stringContent = InternalFunctionUtils.getTextDecoder().decode(firstChild);
                result = btoa(stringContent);
            }

            return result;
        });
    }
}
