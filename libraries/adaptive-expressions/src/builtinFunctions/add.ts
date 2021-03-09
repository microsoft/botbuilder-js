/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Return the result from adding two or more numbers (pure number case) or concatting two or more strings (other case).
 */
export class Add extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Add](xref:adaptive-expressions.Add) class.
     */
    public constructor() {
        super(ExpressionType.Add, Add.evaluator(), ReturnType.String | ReturnType.Number, Add.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applySequenceWithError((args: readonly unknown[]): ValueWithError => {
            let value: unknown;
            let error: string;
            const firstChild = args[0];
            const secondChild = args[1];
            const stringConcat = !FunctionUtils.isNumber(firstChild) || !FunctionUtils.isNumber(secondChild);
            if (
                (firstChild == null && FunctionUtils.isNumber(secondChild)) ||
                (secondChild == null && FunctionUtils.isNumber(firstChild))
            ) {
                error = "Operator '+' or add cannot be applied to operands of type 'number' and null object.";
            } else if (stringConcat) {
                if (
                    (firstChild === null || firstChild === undefined) &&
                    (secondChild === null || secondChild === undefined)
                ) {
                    value = '';
                } else if (firstChild == null) {
                    value = secondChild.toString();
                } else if (secondChild == null) {
                    value = firstChild.toString();
                } else {
                    value = firstChild.toString() + secondChild.toString();
                }
            } else if (FunctionUtils.isNumber(firstChild) && FunctionUtils.isNumber(secondChild)) {
                value = firstChild + secondChild;
            } else {
                value = `${firstChild}${secondChild}`;
            }

            return { value, error };
        }, FunctionUtils.verifyNumberOrStringOrNull);
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(
            expression,
            2,
            Number.MAX_SAFE_INTEGER,
            ReturnType.String | ReturnType.Number
        );
    }
}
