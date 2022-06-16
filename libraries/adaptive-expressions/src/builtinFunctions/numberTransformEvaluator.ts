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
 * Evaluator that transforms a number to another number.
 */
export class NumberTransformEvaluator extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [NumberTransformEvaluator](xref:adaptive-expressions.NumberTransformEvaluator) class.
     *
     * @param type Name of the built-in function.
     * @param func The evaluation function, it takes a list of objects and returns a number.
     */
    constructor(type: string, func: (args: any[]) => number) {
        super(type, NumberTransformEvaluator.evaluator(func), ReturnType.Number, FunctionUtils.validateUnaryNumber);
    }

    /**
     * @private
     */
    private static evaluator(func: (args: any[]) => number): EvaluateExpressionDelegate {
        return FunctionUtils.apply(func, FunctionUtils.verifyNumber);
    }
}
