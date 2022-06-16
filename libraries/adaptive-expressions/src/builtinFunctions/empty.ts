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
 * 1.Input is null or undefined.
 * 2.Input is a null or empty string.
 * 3.Input is zero size collection.
 * 4.Input is an object with no property.
 */
export class Empty extends ComparisonEvaluator {
    /**
     * Initializes a new instance of the [Empty](xref:adaptive-expressions.Empty) class.
     */
    constructor() {
        super(ExpressionType.Empty, Empty.func, FunctionUtils.validateUnary, FunctionUtils.verifyContainerOrNull);
    }

    /**
     * @private
     */
    private static func(args: any[]): boolean {
        return Empty.isEmpty(args[0]);
    }

    /**
     * @private
     */
    private static isEmpty(instance: any): boolean {
        let result: boolean;
        if (instance == null) {
            result = true;
        } else if (typeof instance === 'string') {
            result = instance === '';
        } else if (Array.isArray(instance)) {
            result = instance.length === 0;
        } else if (instance instanceof Map) {
            result = instance.size === 0;
        } else {
            result = Object.keys(instance).length === 0;
        }

        return result;
    }
}
