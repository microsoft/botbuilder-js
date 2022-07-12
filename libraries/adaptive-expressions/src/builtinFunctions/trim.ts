/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionType } from '../expressionType';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { StringTransformEvaluator } from './stringTransformEvaluator';

/**
 * Remove leading and trailing whitespace from a string, and return the updated string.
 */
export class Trim extends StringTransformEvaluator {
    /**
     * Initializes a new instance of the [Trim](xref:adaptive-expressions.Trim) class.
     */
    constructor() {
        super(ExpressionType.Trim, Trim.evaluator);
    }

    /**
     * @private
     */
    private static evaluator(args: unknown[]): string {
        const firstArg = args[0];
        if (typeof firstArg === 'string' || firstArg === undefined) {
            return String(InternalFunctionUtils.parseStringOrUndefined(firstArg)).trim();
        }
    }
}
