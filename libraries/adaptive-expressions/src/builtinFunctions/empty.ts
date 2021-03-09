/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ComparisonEvaluator } from './comparisonEvaluator';

/**
 * Check whether an instance is empty. Return true if the input is empty. Empty means:
 * 1.Input is a null or empty string.
 * 2.Input is zero size collection.
 * 3.Input is an object with no property.
 */
export class Empty extends ComparisonEvaluator {
    /**
     * Initializes a new instance of the [Empty](xref:adaptive-expressions.Empty) class.
     */
    public constructor() {
        super(ExpressionType.Empty, Empty.func, FunctionUtils.validateUnary, FunctionUtils.verifyContainer);
    }

    /**
     * @private
     */
    private static func(args: readonly unknown[]): boolean {
        return Empty.isEmpty(args[0]);
    }

    /**
     * @private
     */
    private static isEmpty(instance: unknown): boolean {
        let result: boolean;
        if (typeof instance === 'string') {
            result = instance === '';
        } else if (Array.isArray(instance)) {
            result = instance.length === 0;
        } else if (instance instanceof Map) {
            result = instance.size === 0;
        } else if (typeof instance === 'object') {
            result = Object.keys(instance).length === 0;
        }

        return result;
    }
}
