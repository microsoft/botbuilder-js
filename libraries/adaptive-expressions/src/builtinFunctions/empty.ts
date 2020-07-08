/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ComparisonEvaluator } from './comparisonEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

/**
 * Check whether an instance is empty. Return true if the input is empty. Empty means:
 * 1.input is null or undefined
 * 2.input is a null or empty string
 * 3.input is zero size collection
 * 4.input is an object with no property.
 */
export class Empty extends ComparisonEvaluator {
    public constructor() {
        super(ExpressionType.Empty, Empty.func, FunctionUtils.validateUnary, FunctionUtils.verifyContainer);
    }

    private static func(args: any[]): boolean {
        return Empty.isEmpty(args[0]);
    }

    private static isEmpty(instance: any): boolean {
        let result: boolean;
        if (instance === undefined) {
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