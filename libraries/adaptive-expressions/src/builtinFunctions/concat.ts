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
import { InternalFunctionUtils } from '../functionUtils.internal';

/**
 * Combine two or more strings, and return the combined string.
 */
export class Concat extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Concat](xref:adaptive-expressions.Concat) class.
     */
    constructor() {
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
        return FunctionUtils.applySequence((args: any[]): string => {
            const firstItem = args[0];
            const secondItem = args[1];
            const isFirstList = Array.isArray(firstItem);
            const isSecondList = Array.isArray(secondItem);

            if (firstItem == null && secondItem == null) {
                return undefined;
            } else if (firstItem == null && isSecondList) {
                return secondItem;
            } else if (secondItem == null && isFirstList) {
                return firstItem;
            } else if (isFirstList && isSecondList) {
                return firstItem.concat(secondItem);
            } else {
                return (
                    InternalFunctionUtils.commonStringify(firstItem) + InternalFunctionUtils.commonStringify(secondItem)
                );
            }
        });
    }
}
