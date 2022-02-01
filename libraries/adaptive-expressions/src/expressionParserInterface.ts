/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Expression } from './expression';

/**
 * Interface to parse a string into an Expression
 */
export interface ExpressionParserInterface {
    /**
     * Parse a string into an Expression
     *
     * @param expression Expression to parse.
     * @returns The resulting expression.
     */
    parse(expression: string): Expression;
}
