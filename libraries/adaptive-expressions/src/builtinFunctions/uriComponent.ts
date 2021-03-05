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
    /**
     * Initializes a new instance of the [UriComponent](xref:adaptive-expressions.UriComponent) class.
     */
    public constructor() {
        super(ExpressionType.UriComponent, UriComponent.evaluator(), ReturnType.String, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: readonly unknown[]): string => encodeURIComponent(args[0] as string),
            FunctionUtils.verifyString
        );
    }
}
