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

export interface Optimizer {
    optimize(clause: Clause): Clause;
}

export interface PredicateComparer {
    predicate: string;
    relationship(predicate: Expression, other: Expression): RelationshipType;
}