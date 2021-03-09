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
 * Combine two or more strings, and return the combined string.
 */
export class Concat extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Concat](xref:adaptive-expressions.Concat) class.
     */
    public constructor() {
        super(
            ExpressionType.Concat,
            Concat.evaluator(),
            ReturnType.String | ReturnType.Array,
            FunctionUtils.validateAtLeastOne
        );
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applySequence((args: readonly unknown[]): unknown => {
            const firstItem = args[0];
            const secondItem = args[1];

            if (firstItem == null && secondItem == null) {
                return undefined;
            } else if (firstItem == null && Array.isArray(secondItem)) {
                return secondItem;
            } else if (secondItem == null && Array.isArray(firstItem)) {
                return firstItem;
            } else if (Array.isArray(firstItem) && Array.isArray(secondItem)) {
                return firstItem.concat(secondItem);
            } else {
                return Concat.commonStringify(firstItem) + Concat.commonStringify(secondItem);
            }
        });
    }

    /**
     * @private
     */
    private static commonStringify(input: unknown): string {
        if (input == null) {
            return '';
        }
        if (Array.isArray(input)) {
            return input.toString();
        } else if (typeof input === 'object') {
            return JSON.stringify(input);
        } else {
            return input.toString();
        }
    }
}
