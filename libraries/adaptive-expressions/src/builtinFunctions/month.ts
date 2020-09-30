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
 * Return the month of the specified timestamp.
 */
export class Month extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the `Month` class.
     */
    public constructor() {
        super(ExpressionType.Month, Month.evaluator(), ReturnType.Number, FunctionUtils.validateUnaryString);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => InternalFunctionUtils.parseTimestamp(args[0], (timestamp: Date): number => timestamp.getUTCMonth() + 1),
            FunctionUtils.verifyString);
    }
}
