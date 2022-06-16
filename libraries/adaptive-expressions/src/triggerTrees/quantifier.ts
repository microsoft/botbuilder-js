/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Type of quantifier for expanding trigger expressions.
 */
export enum QuantifierType {
    /**
     * Within a clause, duplicate any predicate with variable for each possible binding.
     */
    all = 'all',

    /**
     * Create a new clause for each possible binding of variable.
     */
    any = 'any',
}

/**
 * Quantifier for allowing runtime expansion of expressions.
 */
export class Quantifier {
    /**
     * Initializes a new instance of the `Quantifier` class.
     *
     * @param variable Name of variable to replace.
     * @param type Type of quantifier.
     * @param bindings Possible bindings for variable.
     */
    constructor(readonly variable: string, readonly type: QuantifierType, readonly bindings: string[]) {}

    /**
     * @returns A string that represents the quantifier.
     */
    toString(): string {
        return `${this.type} ${this.variable} ${this.bindings.length}`;
    }
}
