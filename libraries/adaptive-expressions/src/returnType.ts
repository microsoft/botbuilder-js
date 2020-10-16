/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Type expected from evalating an expression.
 */
export enum ReturnType {
    /**
     * True or false boolean value.
     */
    Boolean = 1,

    /**
     * Numerical value like int, float, double, ...
     */
    Number = 2,

    /**
     * Any value is possible.
     */
    Object = 4,

    /**
     * String value.
     */
    String = 8,

    /**
     * Array value.
     */
    Array = 16,
}
