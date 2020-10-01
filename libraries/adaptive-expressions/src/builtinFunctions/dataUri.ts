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
 * Return a data uniform resource identifier (URI) of a string.
 */
export class DataUri extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the `DataUri` class.
     */
    public constructor() {
        super(ExpressionType.DataUri, DataUri.evaluator(), ReturnType.String, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): string =>
                'data:text/plain;charset=utf-8;base64,'.concat(Buffer.from(args[0]).toString('base64')),
            FunctionUtils.verifyString
        );
    }
}
