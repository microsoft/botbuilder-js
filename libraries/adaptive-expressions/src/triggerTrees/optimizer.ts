/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Clause } from './clause';
import { Expression } from '../expression';
import { RelationshipType } from './relationshipType';

/**
 * Optimize a clause by rewriting it.
 */
export interface Optimizer {
    /**
     * Optionally rewrite a clause.
     *
     * @param clause Original clause.
     * @returns Optimized clause.
     */
    optimize(clause: Clause): Clause;
}

/**
 * Compare two predicates to identifiy the relationship between them.
 */
export interface PredicateComparer {
    /**
     * Name of the predicate.
     */
    predicate: string;

    /**
     * Identify the relationship between two predicates.
     *
     * @param predicate First predicate.
     * @param other Second predicate.
     * @returns Relationship between predicates.
     */
    relationship(predicate: Expression, other: Expression): RelationshipType;
}

export type PredicateComparers = {
    [name: string]: PredicateComparer;
};
