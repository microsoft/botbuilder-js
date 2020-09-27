/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Clause } from './clause';
import { Constant } from '../constant';
import { Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { MemoryInterface } from '../memory';
import { PredicateComparers } from './optimizer';
import { Quantifier, QuantifierType } from './quantifier';
import { RelationshipType } from './relationshipType';
import { TriggerTree } from './triggerTree';

/**
 * Rewrite the expression by pushing not down to the leaves.
 */
const pushDownNot = (expression: Expression, inNot = false): Expression => {
    let newExpr = expression;
    const negation = expression.evaluator.negation;
    switch (expression.type) {
        case ExpressionType.And:
        case ExpressionType.Or:
            const children = expression.children.map(child => pushDownNot(child, inNot));
            if (children.length === 1) {
                newExpr = children[0];
            } else {
                newExpr = Expression.makeExpression(
                    expression.type === ExpressionType.And
                        ? (inNot ? ExpressionType.Or : ExpressionType.And)
                        : (inNot ? ExpressionType.And : ExpressionType.Or),
                    undefined,
                    ...children);
            }
            break;
        case ExpressionType.Not:
            newExpr = pushDownNot(expression.children[0], !inNot);
            break;
        default:
            if (inNot) {
                if (negation) {
                    if (expression.type === negation.type) {
                        // Pass through like optional/ignore
                        newExpr = Expression.makeExpression(
                            undefined,
                            negation,
                            ...expression.children.map(child => pushDownNot(child, true))
                        );
                    } else {
                        // Replace with negation and stop
                        newExpr = Expression.makeExpression(
                            undefined,
                            negation,
                            ...expression.children
                        );
                    }
                } else {
                    // Keep not
                    newExpr = Expression.makeExpression(ExpressionType.Not, undefined, expression);
                }
            }
            break;
    }

    return newExpr;
};

/**
 * A trigger is a combination of a trigger expression and the corresponding action.
 */
export class Trigger {
    private readonly _quantifiers: Quantifier[];
    private readonly _tree: TriggerTree;
    private _clauses: Clause[];

    /**
     * Intializes a new instance of the `Trigger` class.
     * @param tree Trigger tree that contains this trigger.
     * @param expression Expression for when the trigger action is possible.
     * @param action Action to take when a trigger matches.
     * @param quantifiers Quantifiers to dynamically expand the expression.
     */
    public constructor(tree: TriggerTree, expression?: Expression, action?: any, ...quantifiers: Quantifier[]) {
        this._tree = tree;
        this.action = action;
        this.originalExpression = expression;
        this._quantifiers = quantifiers;
        if (expression) {
            const normalForm = pushDownNot(expression);
            this._clauses = this.generateClauses(normalForm);
            this.removeDuplicatedPredicates();
            this.optimizeClauses();
            this.expandQuantifiers();
            this.removeDuplicates();
            this.markSubsumedClauses();
            this.splitIgnores();
        } else {
            this._clauses = [];
        }
    }

    /**
     * Original trigger expression.
     */
    public readonly originalExpression: Expression;

    /**
     * Action to take when trigger is true.
     */
    public readonly action: any;

    /**
     * Gets list of expressions converted into Disjunctive Normal Form where ! is pushed to the leaves and
     * there is an implicit || between clauses and && within a clause.
     */
    public get clauses(): Clause[] {
        return this._clauses;
    }

    /**
     * Determines the relationship between current instance and another `Trigger` instance.
     * @param other The other Trigger instance.
     * @param comparers The comparer dictionary.
     * @returns A `RelationshipType` value.
     */
    public relationship(other: Trigger, comparers: PredicateComparers): RelationshipType {
        let result: RelationshipType;
        const first = this._relationship(this, other, comparers);
        const second = this._relationship(other, this, comparers);
        if (first === RelationshipType.equal) {
            if (second === RelationshipType.equal) {
                // All first clauses == second clauses
                result = RelationshipType.equal;
            } else {
                // All first clauses found in second
                result = RelationshipType.specializes;
            }
        } else if (first === RelationshipType.specializes) {
            // All first clauses specializes or equal a second clause
            result = RelationshipType.specializes;
        } else if (second === RelationshipType.equal || second === RelationshipType.specializes) {
            // All second clauses are equal or specialize a first clause
            result = RelationshipType.generalizes;
        } else {
            // All other cases are in comparable
            result = RelationshipType.incomparable;
        }
        return result;
    }

    /**
     * Determines whether there is a member in the current `Clause` that matches the nodeClause parameter.
     * @param nodeClause The other Clause instance to match.
     * @param state The scope for looking up variables.
     * @returns A boolean value inidicating whether there is a member matches.
     */
    public matches(nodeClause: Clause, state: MemoryInterface | any): boolean {
        let found = false;
        for (const clause of this.clauses) {
            if (clause.matches(nodeClause, state)) {
                found = true;
                break;
            }
        }

        return found;
    }

    /**
     * Gets a string that represents the current trigger.
     * @param builder An array of string to build the string of trigger.
     * @param indent An integer represents the number of spaces at the start of a line.
     */
    public toString(builder: string[] = [], indent = 0): string {
        builder.push(' '.repeat(indent));
        if (this._clauses.length > 0) {
            let first = true;
            for (const clause of this._clauses) {
                if (first) {
                    first = false;
                } else {
                    builder.push('\n');
                    builder.push(' '.repeat(indent));
                    builder.push('|| ');
                }

                builder.push(clause.toString());
            }
        } else {
            builder.push('<Empty>');
        }
        return builder.join('');
    }

    private _relationship(trigger: Trigger, other: Trigger, comparers: PredicateComparers): RelationshipType {
        let soFar = RelationshipType.incomparable;
        for (const clause of trigger.clauses) {
            if (!clause.subsumed) {
                // Check other for = or clause that is specialized
                let clauseSoFar = RelationshipType.incomparable;
                for (const second of other.clauses) {
                    if (!second.subsumed) {
                        const reln = clause.relationship(second, comparers);
                        if (reln === RelationshipType.equal || reln === RelationshipType.specializes) {
                            clauseSoFar = reln;
                            break;
                        }

                    }
                }

                if (clauseSoFar === RelationshipType.incomparable) {
                    // Some clause is not comparable
                    soFar = RelationshipType.incomparable;
                    break;
                }

                if (clauseSoFar === RelationshipType.equal) {
                    if (soFar === RelationshipType.incomparable) {
                        // Start on equal clause
                        soFar = clauseSoFar;
                    }
                } else if (clauseSoFar === RelationshipType.specializes) {
                    // Either going from incomparable or equal to specializes
                    soFar = clauseSoFar;
                }
            }
        }

        // Either incomparable, equal or specializes
        return soFar;
    }

    private generateClauses(expression: Expression): Clause[] {
        switch (expression.type) {
            case ExpressionType.And:
                // Need to combine every combination of clauses
                let soFar: Clause[] = [];
                let first = true;
                for (let i = 0; i < expression.children.length; i++) {
                    const child = expression.children[i];
                    const clauses = this.generateClauses(child);
                    if (clauses.length === 0) {
                        // Encountered false
                        soFar = [];
                        break;
                    }

                    if (first) {
                        soFar.push(...clauses);
                        first = false;
                    } else {
                        const newClauses: Clause[] = [];
                        for (const old of soFar) {
                            for (const clause of clauses) {
                                const children: Expression[] = [];
                                children.push(...old.children);
                                children.push(...clause.children);
                                newClauses.push(new Clause(children));
                            }
                        }
                        soFar = newClauses;
                    }
                }
                return soFar;
            case ExpressionType.Or:
                const clauses: Clause[] = [];
                for (let i = 0; i < expression.children.length; i++) {
                    const child = expression.children[i];
                    clauses.push(...this.generateClauses(child));
                }
                return clauses;
            case ExpressionType.Optional:
                return [
                    new Clause(),
                    ...this.generateClauses(expression.children[0])
                ];
            default:
                // True becomes empty expression and false drops clause
                if (expression instanceof Constant && typeof (expression.value) === 'boolean') {
                    if (expression.value) {
                        return [new Clause()];
                    }
                } else {
                    return [new Clause(expression)];
                }
                return [];
        }
    }

    /**
     * Remove any duplicate predicates within a clause.
     * NOTE: This is annoying but expression hash codes of deepEquals expressions are different.
     */
    private removeDuplicatedPredicates(): void {
        // Rewrite clauses to remove duplicated tests
        for (let i = 0; i < this._clauses.length; ++i) {
            const clause = this._clauses[i];
            const children: Expression[] = [];
            for (let p = 0; p < clause.children.length; ++p) {
                const pred = clause.children[p];
                let found = false;
                for (let q = p + 1; q < clause.children.length; ++q) {
                    if (pred.deepEquals(clause.children[q])) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    children.push(pred);
                }
            }

            this._clauses[i] = new Clause(children);
        }
    }

    /**
     * Mark clauses that are more specific than another clause as subsumed and also remove any = clauses.
     */
    private markSubsumedClauses(): void {
        for (let i = 0; i < this._clauses.length; ++i) {
            const clause = this._clauses[i];
            if (!clause.subsumed) {
                for (let j = i + 1; j < this._clauses.length; ++j) {
                    const other = this._clauses[j];
                    if (!other.subsumed) {
                        const reln = clause.relationship(other, this._tree.comparers);
                        if (reln === RelationshipType.equal) {
                            this._clauses.splice(j, 1);
                            --j;
                        } else {
                            if (reln === RelationshipType.specializes) {
                                clause.subsumed = true;
                                break;
                            }

                            if (reln === RelationshipType.generalizes) {
                                other.subsumed = true;
                            }
                        }
                    }
                }
            }
        }
    }

    private splitIgnores(): void {
        for (let i = 0; i < this._clauses.length; i++) {
            this._clauses[i].splitIgnores();
        }
    }

    private optimizeClauses(): void {
        for (let i = 0; i < this._clauses.length; i++) {
            const clause = this._clauses[i];
            for (let j = 0; j < this._tree.optimizers.length; j++) {
                const optimizer = this._tree.optimizers[j];
                optimizer.optimize(clause);
            }
        }
    }

    private expandQuantifiers(): void {
        if (this._quantifiers && this._quantifiers.length > 0) {
            for (let i = 0; i < this._quantifiers.length; i++) {
                const quantifier = this._quantifiers[i];
                const newClauses: Clause[] = [];
                for (let j = 0; j < this._clauses.length; j++) {
                    const clause = this._clauses[j];
                    newClauses.push(...this._expandQuantifiers(quantifier, clause));
                }

                this._clauses = newClauses;
            }
        }
    }

    private _expandQuantifiers(quantifier: Quantifier, clause: Clause): Clause[] {
        const results: Clause[] = [];
        if (quantifier.type === QuantifierType.all) {
            const children: Expression[] = [];
            if (quantifier.bindings.length > 0) {
                for (let i = 0; i < clause.children.length; i++) {
                    const predicate = clause.children[i];
                    for (let j = 0; j < quantifier.bindings.length; j++) {
                        const binding = quantifier.bindings[j];
                        const { expression: newPredicate, changed } = this.substituteVariable(quantifier.variable, binding, predicate);
                        children.push(newPredicate);
                        if (!changed) {
                            // No change to first predicate, so can stop
                            break;
                        }
                    }
                }
            } else {
                // Empty quantifier is trivially true so remove any predicate that refers to quantifier
                for (let i = 0; i < clause.children.length; i++) {
                    const predicate = clause.children[i];
                    const { changed } = this.substituteVariable(quantifier.variable, '', predicate);
                    if (!changed) {
                        children.push(predicate);
                    }
                }
            }
            results.push(new Clause(children));
        } else {
            if (quantifier.bindings.length > 0) {
                let changed = false;
                for (let i = 0; i < quantifier.bindings.length; i++) {
                    const binding = quantifier.bindings[i];
                    const newClause = new Clause(clause);
                    const children: Expression[] = [];
                    for (let j = 0; j < clause.children.length; j++) {
                        const predicate = clause.children[j];
                        const { expression: newPredicate, changed: predicateChanged } = this.substituteVariable(quantifier.variable, binding, predicate);
                        changed = changed || predicateChanged;
                        children.push(newPredicate);
                    }

                    if (changed) {
                        newClause.anyBindings[quantifier.variable] = binding;
                    }

                    newClause.children = [...children];
                    results.push(newClause);
                    if (!changed) {
                        break;
                    }
                }
            } else {
                // Keep clause if does not contain any binding
                let changed = false;
                for (let i = 0; i < clause.children.length; i++) {
                    const predicate = clause.children[i];
                    const { changed: predicateChanged } = this.substituteVariable(quantifier.variable, '', predicate);
                    if (predicateChanged) {
                        changed = true;
                        break;
                    }
                }

                if (!changed) {
                    results.push(clause);
                }
            }
        }

        return results;
    }

    private substituteVariable(variable: string, binding: string, expression: Expression): { expression: Expression, changed: boolean } {
        let newExpr = expression;
        let changed = false;
        if (expression.type === ExpressionType.Accessor
            && expression.children.length === 1
            && expression.children[0] instanceof Constant
            && (typeof (expression.children[0] as Constant).value) === 'string'
            && (expression.children[0] as Constant).value === variable) {
            newExpr = Expression.makeExpression(ExpressionType.Accessor, undefined, new Constant(binding));
            changed = true;
        } else {
            const children: Expression[] = [];
            for (let i = 0; i < expression.children.length; i++) {
                const child = expression.children[i];
                const { expression: childExpr, changed: childChanged } = this.substituteVariable(variable, binding, child);
                children.push(childExpr);
                changed = changed || childChanged;
            }

            if (changed) {
                newExpr = new Expression(undefined, expression.evaluator, ...children);
            }
        }

        return { expression: newExpr, changed };
    }

    private removeDuplicates(): void {
        for (const clause of this._clauses) {
            // NOTE: This is quadratic in clause length but GetHashCode is not equal for expressions and we expect the number of clauses to be small.
            const predicates: Expression[] = [...clause.children];
            for (let i = 0; i < predicates.length; ++i) {
                const first = predicates[i];
                for (let j = i + 1; j < predicates.length;) {
                    const second = predicates[j];
                    if (first.deepEquals(second)) {
                        predicates.splice(j, 1);
                    } else {
                        ++j;
                    }
                }
            }

            clause.children = [...predicates];
        }
    }
}
