/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Relationship between trigger expressions.
 */
export enum RelationshipType {
    /**
     * First argument specializes the second, i.e. applies to a subset of the states the second argument covers.
     */
    specializes = 'specializes',

    /**
     * First and second argument are the same expression.
     */
    equal = 'equal',

    /**
     * First argument generalizes the second, i.e. applies to a superset of the states the second argument covers.
     */
    generalizes = 'generalizes',

    /**
     * Connot tell how the first and second arguments relate.
     */
    incomparable = 'incomparable',
}
