/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator } from './expressionEvaluator';

/**
 * Interface for adding custom functions to the expression parser.
 */
export interface ComponentExpressionFunctionsInteerface {

    /**
     * Return collection of ExpressionEvaluators.
     * @returns enumeration of custom ExpressionEvaluators.
     */
    getExpressionEvaluators(): ExpressionEvaluator[];
}