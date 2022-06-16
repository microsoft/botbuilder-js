/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Clause } from './clause';
import { MemoryInterface } from '../memory';
import { RelationshipType } from './relationshipType';
import { TriggerTree } from './triggerTree';
import { Trigger } from './trigger';

enum Operation {
    none = 'none',
    found = 'found',
    added = 'added',
    removed = 'removed',
    inserted = 'inserted',
}

/**
 * Node in a trigger tree.
 */
export class Node {
    private _allTriggers: Trigger[] = [];
    private _triggers: Trigger[] = [];
    private _specializations: Node[] = [];

    /**
     * Intializes a new instance of the `Node` class.
     *
     * @param clause The logical conjunction this node represents.
     * @param tree The trigger tree this node is found in.
     * @param trigger The trigger to initialize this node.
     */
    constructor(clause: Clause, tree: TriggerTree, trigger?: Trigger) {
        this.clause = new Clause(clause);
        this.tree = tree;
        if (trigger) {
            this._allTriggers.push(trigger);
            this._triggers.push(trigger);
        }
    }

    /**
     * Gets all of the most specific triggers that contains the `Clause` in this node.
     *
     * @returns All of the most specific triggers that contains the `Clause` in this node.
     */
    get triggers(): Trigger[] {
        return this._triggers;
    }

    /**
     * Gets all triggers that contain the `Clause` in this node.
     *
     * @returns All triggers that contain the `Clause` in this node.
     */
    get allTriggers(): Trigger[] {
        return this._allTriggers;
    }

    /**
     * Gets specialized children of this node.
     *
     * @returns Specialized children of this node.
     */
    get specializations(): Node[] {
        return this._specializations;
    }

    /**
     * Gets the logical conjunction this node represents.
     */
    clause: Clause;

    /**
     * Gets the tree this node is found in.
     */
    tree: TriggerTree;

    /**
     * Gets a string that represents the current node.
     *
     * @param builder An array of string to build the string of node.
     * @param indent An integer representing the number of spaces at the start of a line.
     * @returns A string that represents the current node.
     */
    toString(builder: string[] = [], indent = 0): string {
        return this.clause.toString(builder, indent);
    }

    /**
     * Identify the relationship between two nodes.
     *
     * @param other Node to compare against.
     * @returns Relationship between this node an the other.
     */
    relationship(other: Node): RelationshipType {
        return this.clause.relationship(other.clause, this.tree.comparers);
    }

    /**
     * Gets the most specific matches below this node.
     *
     * @param state Frame to evaluate against.
     * @returns List of the most specific matches found.
     */
    matches(state: MemoryInterface | any): Trigger[] {
        const matches = new Set<Trigger>();
        this._matches(state, matches, new Map<Node, boolean>());
        return Array.from(matches);
    }

    /**
     * Adds a child node.
     *
     * @param triggerNode The node to be added.
     * @returns Whether adding node operation is successful.
     */
    addNode(triggerNode: Node): boolean {
        return this._addNode(triggerNode, new Map<Node, Operation>()) === Operation.added;
    }

    /**
     * Removes a trigger from node.
     *
     * @param trigger The trigger to be removed.
     * @returns Whether removing trigger operation is successful.
     */
    removeTrigger(trigger: Trigger): boolean {
        return this._removeTrigger(trigger, new Set<Node>());
    }

    private _addNode(triggerNode: Node, ops: Map<Node, Operation>): Operation {
        if (ops.has(this)) {
            return Operation.none;
        }

        let op = Operation.none;
        const trigger = triggerNode.triggers[0];
        const relationship = this.relationship(triggerNode);
        switch (relationship) {
            case RelationshipType.equal: {
                // Ensure action is not already there
                const found =
                    this._allTriggers.find(
                        (existing) => trigger.action != undefined && trigger.action === existing.action
                    ) !== undefined;
                op = Operation.found;
                if (!found) {
                    this._allTriggers.push(trigger);
                    let add = true;
                    for (let i = 0; i < this._triggers.length; ) {
                        const existing = this._triggers[i];
                        const reln = trigger.relationship(existing, this.tree.comparers);
                        if (reln === RelationshipType.generalizes) {
                            add = false;
                            break;
                        } else if (reln === RelationshipType.specializes) {
                            this._triggers.splice(i, 1);
                        } else {
                            ++i;
                        }
                    }

                    if (add) {
                        this._triggers.push(trigger);
                    }

                    op = Operation.added;
                }
                break;
            }
            case RelationshipType.incomparable:
                for (const child of this._specializations) {
                    child._addNode(triggerNode, ops);
                }
                break;
            case RelationshipType.specializes:
                triggerNode._addSpecialization(this);
                op = Operation.inserted;
                break;
            case RelationshipType.generalizes: {
                let foundOne = false;
                let removals: Node[];
                for (let i = 0; i < this._specializations.length; i++) {
                    const child = this._specializations[i];
                    const childOp = child._addNode(triggerNode, ops);
                    if (childOp != Operation.none) {
                        foundOne = true;
                        if (childOp === Operation.inserted) {
                            if (!removals) {
                                removals = [];
                            }
                            removals.push(child);
                            op = Operation.added;
                        } else {
                            op = childOp;
                        }
                    }
                }

                if (removals) {
                    for (const removal of removals) {
                        const removed = this._specializations.findIndex((item) => item === removal);
                        if (removed >= 0) {
                            this._specializations.splice(removed, 1);
                        }
                    }
                    this._specializations.push(triggerNode);
                }

                if (!foundOne) {
                    this._specializations.push(triggerNode);
                    op = Operation.added;
                }
                break;
            }
        }

        // Prevent visiting this node again
        ops.set(this, op);
        return op;
    }

    private _matches(state: MemoryInterface | any, matches: Set<Trigger>, matched: Map<Node, boolean>): boolean {
        let found = matched.get(this);
        if (found) {
            return true;
        }

        found = false;
        for (const child of this._specializations) {
            if (child._matches(state, matches, matched)) {
                found = true;
            }
        }

        // No child matched so we might
        if (!found) {
            const { value: match, error } = this.clause.tryEvaluate(state);
            if (!error && match) {
                for (const trigger of this.triggers) {
                    if (trigger.matches(this.clause, state)) {
                        matches.add(trigger);
                        found = true;
                    }
                }
            }
        }

        matched.set(this, found);
        return found;
    }

    private _removeTrigger(trigger: Trigger, visited: Set<Node>): boolean {
        if (visited.has(this)) {
            return false;
        }

        visited.add(this);
        let removed = false;

        // Remove from allTriggers and triggers
        const allTriggerIndex = this._allTriggers.findIndex((item) => item === trigger);
        if (allTriggerIndex >= 0) {
            // We found the trigger somewhere in the tree
            this._allTriggers.splice(allTriggerIndex, 1);
            removed = true;

            const triggerIndex = this._triggers.findIndex((item) => item === trigger);
            if (triggerIndex >= 0) {
                this._triggers.splice(triggerIndex, 1);

                for (const candidate of this._allTriggers) {
                    let add = true;
                    for (const existing of this._triggers) {
                        const reln = candidate.relationship(existing, this.tree.comparers);
                        if (reln === RelationshipType.equal || reln === RelationshipType.generalizes) {
                            add = false;
                            break;
                        }
                    }

                    if (add) {
                        this._triggers.push(candidate);
                    }
                }
            }
        }

        // Remove from any children
        let removals: Node[];
        for (let i = 0; i < this._specializations.length; i++) {
            const child = this._specializations[i];
            const childRemoved = child._removeTrigger(trigger, visited);
            if (childRemoved) {
                removed = true;
            }
            if (child.triggers.length === 0) {
                if (!removals) {
                    removals = [];
                }
                removals.push(child);
            }
        }

        if (removals) {
            // Remove children if no triggers left
            for (const removal of removals) {
                const removedIndex = this._specializations.findIndex((item) => item === removal);
                if (removedIndex >= 0) {
                    this._specializations.splice(removedIndex, 1);
                    for (const specialization of removal.specializations) {
                        let add = true;
                        for (const parent of this._specializations) {
                            const reln = parent.relationship(specialization);
                            if (reln === RelationshipType.generalizes) {
                                add = false;
                                break;
                            }
                        }

                        if (add) {
                            this._specializations.push(specialization);
                        }
                    }
                }
            }
        }

        return removed;
    }

    private _addSpecialization(specialization: Node): boolean {
        let added = false;
        let removals: Node[];
        let skip = false;
        for (let i = 0; i < this._specializations.length; i++) {
            const child = this._specializations[i];
            const reln = specialization.relationship(child);
            if (reln === RelationshipType.equal) {
                skip = true;
                break;
            }

            if (reln === RelationshipType.generalizes) {
                if (!removals) {
                    removals = [];
                }
                removals.push(child);
            } else if (reln === RelationshipType.specializes) {
                skip = true;
                break;
            }
        }

        if (!skip) {
            if (removals) {
                for (const removal of removals) {
                    // Don't need to add back because specialization already has them
                    const removed = this._specializations.findIndex((item) => item === removal);
                    if (removed >= 0) {
                        specialization._addSpecialization(this._specializations[removed]);
                        this._specializations.splice(removed, 1);
                    }
                }
            }

            this._specializations.push(specialization);
            added = true;
        }

        return added;
    }
}
