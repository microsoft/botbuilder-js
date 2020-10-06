/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { Clause } from './clause';
import { MemoryInterface } from '../memory';
import { Node } from './node';
import { Optimizer, PredicateComparers } from './optimizer';
import { Quantifier } from './quantifier';
import { RelationshipType } from './relationshipType';
import { Trigger } from './trigger';

/**
 * A trigger tree organizes evaluators according to generalization/specialization in order to make it easier to use rules.
 */
export class TriggerTree {
    /**
     * Intializes a new instance of the `TriggerTree` class.
     */
    public constructor() {
        this.root = new Node(new Clause(), this);
    }

    /**
     * A list of `Optimizer` for optimizing claues.
     */
    public readonly optimizers: Optimizer[] = [];

    /**
     * A dictionary of `PredicateComparer` values, with string keys.
     */
    public readonly comparers: PredicateComparers = {};

    /**
     * The root node instance.
     */
    public root: Node;

    /**
     * The total number of triggers.
     */
    public totalTriggers = 0;

    /**
     * Returns a string the represents the current object.
     */
    public toString(): string {
        return `TriggerTree with ${ this.totalTriggers } triggers`;
    }

    /**
     * Add a trigger expression to the tree.
     * @param stringOrExpression Trigger to add.
     * @param action Action when triggered.
     * @param quantifiers Quantifiers to use when expanding expressions.
     * @returns New trigger.
     */
    public addTrigger(stringOrExpression: string | Expression, action: any, ...quantifiers: Quantifier[]): Trigger {
        const expression: Expression = (typeof stringOrExpression === 'string') ?
            Expression.parse(stringOrExpression) : stringOrExpression;
        const trigger = new Trigger(this, expression, action, ...quantifiers);
        let added = false;
        if (trigger.clauses.length) {
            for (const clause of trigger.clauses) {
                const newNode = new Node(clause, this, trigger);
                if (this.root.addNode(newNode)) {
                    added = true;
                }
            }
        }

        if (added) {
            ++this.totalTriggers;
        }

        return trigger;
    }

    /**
     * Remove trigger from tree.
     * @param trigger Trigger to remove.
     * @returns True if removed trigger.
     */
    public removeTrigger(trigger: Trigger): boolean {
        const result = this.root.removeTrigger(trigger);
        if (result) {
            --this.totalTriggers;
        }
        return result;
    }

    /**
     * Generates a string describing the tree.
     * @param indent Current indent level.
     * @returns String describing the tree.
     */
    public treeToString(indent = 0): string {
        const builder: string[] = [];
        this._treeToString(builder, this.root, indent);
        return builder.join('');
    }

    /**
     * Return the possible matches given the current state.
     * @param state State to evaluate against.
     * @returns List of possible matches.
     */
    public matches(state: MemoryInterface | any): Trigger[] {
        return this.root.matches(state);
    }

    /**
     * Verify the tree meets specialization/generalization invariants.
     * @returns Bad node if found.
     */
    public verifyTree(): Node {
        return this._verifyTree(this.root, new Set<Node>());
    }

    private _verifyTree(node: Node, visited: Set<Node>): Node {
        let badNode: Node;

        if (!visited.has(node)) {
            visited.add(node);
            for (let i = 0; !badNode && i < node.specializations.length; ++i) {
                const first = node.specializations[i];
                if (node.relationship(first) !== RelationshipType.generalizes) {
                    badNode = node;
                } else {
                    this._verifyTree(node.specializations[i], visited);
                    for (let j = i + 1; j < node.specializations.length; ++j) {
                        const second = node.specializations[j];
                        if (first.relationship(second) !== RelationshipType.incomparable) {
                            badNode = node;
                            break;
                        }
                    }
                }
            }
        }

        return badNode;
    }

    private _treeToString(builder: string[], node: Node, indent: number): void {
        node.toString(builder, indent);
        builder.push(` [${ node.triggers.length }]`);
        builder.push('\n');
        for (const child of node.specializations) {
            this._treeToString(builder, child, indent + 2);
        }
    }
}