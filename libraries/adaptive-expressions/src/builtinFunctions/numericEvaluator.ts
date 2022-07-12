/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Numeric operators that can have 1 or more args.
 */
export class NumericEvaluator extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [NumericEvaluator](xref:adaptive-expressions.NumericEvaluator) class.
     *
     * @param type Name of the built-in function.
     * @param func The evaluation function, it takes a list of objects and returns a number.
     */
    constructor(type: string, func: (args: any[]) => any) {
        super(type, NumericEvaluator.evaluator(func), ReturnType.Number, FunctionUtils.validateNumber);
    }

    /**
     * @private
     */
    private static evaluator(func: (args: any[]) => any): EvaluateExpressionDelegate {
        return FunctionUtils.applySequence(func, FunctionUtils.verifyNumber);
    }
}
