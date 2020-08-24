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
 * Return the binary version of a uniform resource identifier (URI) component.
 */
export class UriComponent extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.UriComponent, UriComponent.evaluator(), ReturnType.String, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: Readonly<any>): string => encodeURIComponent(args[0]), FunctionUtils.verifyString);
    }
}
