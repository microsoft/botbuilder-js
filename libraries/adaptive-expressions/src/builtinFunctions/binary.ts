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
 * Return the binary version of a string.
 */
export class Binary extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.Binary, Binary.evaluator(), ReturnType.Object, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): Uint8Array => InternalFunctionUtils.toBinary(args[0]),
            FunctionUtils.verifyString
        );
    }
}
