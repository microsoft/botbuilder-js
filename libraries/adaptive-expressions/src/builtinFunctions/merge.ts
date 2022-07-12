/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Merge multiple object(json) into one object(json).
 * If the item is array, the elements of the array are merged as well.
 */
export class Merge extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Merge](xref:adaptive-expressions.Merge) class.
     */
    constructor() {
        super(ExpressionType.Merge, Merge.evaluator(), ReturnType.Object, FunctionUtils.validateAtLeastOne);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: unknown[]): ValueWithError => {
                const result = {};
                for (const arg of args) {
                    const objectResult = this.parseToObjectList(arg);
                    if (objectResult.error != null) {
                        return { value: undefined, error: objectResult.error };
                    }

                    for (const item of objectResult.result) {
                        Object.assign(result, item);
                    }
                }

                return { value: result, error: undefined };
            }
        );
    }

    private static parseToObjectList(arg: unknown): { result: Record<string, unknown>[]; error: string } {
        const result: Record<string, unknown>[] = [];
        let error: string;
        if (arg == null) {
            error = `The argument ${arg} must be a JSON object or array.`;
        } else if (Array.isArray(arg)) {
            for (const item of arg) {
                if (typeof item === 'object' && !Array.isArray(item)) {
                    result.push(item);
                } else {
                    error = `The argument ${item} in array must be a JSON object.`;
                }
            }
        } else if (typeof arg === 'object') {
            result.push(arg as Record<string, unknown>);
        } else {
            error = `The argument ${arg} must be a JSON object or array.`;
        }

        return { result: result, error: error };
    }
}
