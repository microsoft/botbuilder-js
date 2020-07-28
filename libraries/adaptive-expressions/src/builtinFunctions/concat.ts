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
    public constructor() {
        super(ExpressionType.Concat, Concat.evaluator(), ReturnType.String | ReturnType.Array, FunctionUtils.validateAtLeastOne);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applySequence((args: any[]): string => {
            const firstItem = args[0];
            const secondItem = args[1];
            const isFirstList = Array.isArray(firstItem);
            const isSecondList = Array.isArray(secondItem);

            if ((firstItem === null || firstItem === undefined)
                && (secondItem === null || secondItem === undefined)) {
                return undefined;
            } else if ((firstItem === null || firstItem === undefined) && isSecondList) {
                return secondItem;
            } else if ((secondItem === null || secondItem === undefined) && isFirstList) {
                return firstItem;
            } else if (isFirstList && isSecondList) {
                return firstItem.concat(secondItem);
            } else {
                return Concat.commonStringify(firstItem) + Concat.commonStringify(secondItem);
            }
        });
    }


    private static commonStringify(input: any): string {
        if (input === null || input === undefined) {
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