/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { Clause } from './clause';
import { Node } from './node';
import { Optimizer, PredicateComparer } from './optimizer';
import { Quantifier } from './quantifier';
import { RelationshipType } from './relationshipType';
import { Trigger } from './trigger';

export class TriggerTree {
    public readonly optimizers: Optimizer[] = [];
    public readonly comparers: { [key: string]: PredicateComparer } = {};
    public root: Node;
    public totalTriggers = 0;
    
    public constructor() {
        this.root = new Node(new Clause(), this);
    }
    
    public toString(): string {
        return `TriggerTree with ${ this.totalTriggers } triggers`;
    }
    
    public addTrigger(stringOrExpression: string | Expression, action: any, ...quantifiers: Quantifier[]): Trigger {
        const expression: Expression = (typeof stringOrExpression === 'string') ?
            Expression.parse(stringOrExpression) : stringOrExpression;
        const trigger = new Trigger(this, expression, action, ...quantifiers);
        let added = false;
        if (trigger.clauses.length > 0) {
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
    
    public removeTrigger(trigger: Trigger): boolean {
        const result = this.root.removeTrigger(trigger);
        if (result) {
            --this.totalTriggers;
        }
        return result;
    }
    
    public matches(state: any): Trigger[] {
        return this.root.matches(state);
    }
    
    public verifyTree(): Node {
        return this._verifyTree(this.root, new Set<Node>());
    }
    
    public treeToString(indent = 0): string {
        const builder: string[] = [];
        this._treeToString(builder, this.root, indent);
        return builder.join('');
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