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

/**
 * Return the binary version of a data uniform resource identifier (URI).
 */
export class DataUriToBinary extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [DataUriToBinary](xref:adaptive-expressions.DataUriToBinary) class.
     */
    constructor() {
        super(
            ExpressionType.DataUriToBinary,
            DataUriToBinary.evaluator(),
            ReturnType.Object,
            FunctionUtils.validateUnary
        );
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): Uint8Array => InternalFunctionUtils.getTextEncoder().encode(args[0]),
            FunctionUtils.verifyString
        );
    }
}
