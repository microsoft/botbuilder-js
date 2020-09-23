/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { PredicateComparer } from './optimizer';
import { RelationshipType } from './relationshipType';

export class Clause extends Expression {
    private _ignored: Expression;

    public constructor(clauseOrExpression?: Clause | Expression | Expression[]) {
        super(ExpressionType.And, undefined);
        if (clauseOrExpression) {
            if (Array.isArray(clauseOrExpression)) {
                const children: Expression[] = clauseOrExpression;
                this.children = children;
            } else if (clauseOrExpression instanceof Clause) {
                const fromClause: Clause = clauseOrExpression;
                this.children = [...fromClause.children];
                for (const key in fromClause.anyBindings) {
                    this.anyBindings[key] = fromClause.anyBindings[key];
                }
            } else if (clauseOrExpression instanceof Expression) {
                const expression: Expression = clauseOrExpression;
                this.children.push(expression);
            }
        }
    }

    public anyBindings: { [key: string]: string } = {};

    public subsumed = false;
    
    public toString(builder: string[] = [], indent = 0): string {
        builder.push(' '.repeat(indent));
        if (this.subsumed) {
            builder.push('*');
        }

        builder.push('(');
        let first = true;
        for (const child of this.children) {
            if (first) {
                first = false;
            } else {
                builder.push(' && ');
            }
            builder.push(child.toString());
        }
        
        builder.push(')');
        if(this._ignored) {
            builder.push(' ignored(');
            builder.push(this._ignored.toString());
            builder.push(')');
        }
        
        for (const key in this.anyBindings) {
            builder.push(` ${ key }->${ this.anyBindings[key] }`);
        }
        return builder.join('');
    }

    public relationship(other: Clause, comparers: { [name: string]: PredicateComparer }): RelationshipType {
        let soFar: RelationshipType = RelationshipType.incomparable;
        let shorter: Clause = this as Clause;
        let shorterCount: number = shorter.children.length;
        let longer: Clause = other;
        let longerCount: number = longer.children.length;
        let swapped = false;
        if (longerCount < shorterCount) {
            longer = this;
            shorter = other;
            const tmp = longerCount;
            longerCount = shorterCount;
            shorterCount = tmp;
            swapped = true;
        }

        if (shorterCount === 0) {
            if (longerCount === 0) {
                soFar = RelationshipType.equal;
            } else {
                soFar = RelationshipType.generalizes;
            }
        } else {
            // If every one of shorter predicates is equal or superset of one in longer, then shorter is a superset of longer
            for (const shortPredicate of shorter.children) {
                let shorterRel = RelationshipType.incomparable;
                for (const longPredicate of longer.children) {
                    shorterRel = this._relationship(shortPredicate, longPredicate, comparers);
                    if (shorterRel !== RelationshipType.incomparable) {
                        // Found related predicates
                        break;
                    }
                }

                if (shorterRel === RelationshipType.incomparable) {
                    // Predicate in shorter is incomparable so done
                    soFar = RelationshipType.incomparable;
                    break;
                } else {
                    if (soFar === RelationshipType.incomparable) {
                        soFar = shorterRel;
                    }

                    if (soFar === RelationshipType.equal) {
                        if (shorterRel === RelationshipType.generalizes
                            || (shorterRel === RelationshipType.specializes && shorterCount === longerCount)
                            || shorterRel === RelationshipType.equal) {
                            soFar = shorterRel;
                        } else {
                            break;
                        }
                    } else if (soFar != shorterRel) {
                        // Not continued with sub/super so incomparable
                        break;
                    }
                }
            }

            if (shorterCount !== longerCount) {
                switch (soFar) {
                    case RelationshipType.equal:
                    case RelationshipType.generalizes:
                        soFar = RelationshipType.generalizes;
                        break;
                    default:
                        soFar = RelationshipType.incomparable;
                        break;
                }
            }

            soFar = this.bindingRelationship(soFar, shorter, longer);
        }

        return this.swap(soFar, swapped);
    }
    
    public matches(clause: Clause, memory: any): boolean {
        let matched = false;
        if (clause.deepEquals(this)) {
            matched = true;
            if (this._ignored) {
                const { value: match, error } = this._ignored.tryEvaluate(memory);
                matched = !error && match;
            }
        }
        
        return matched;
    }
    
    public splitIgnores(): void {
        const children: Expression[] = [];
        const ignores: Expression[] = [];
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            if (child.type === ExpressionType.Ignore) {
                ignores.push(child);
            } else {
                children.push(child);
            }
        }

        this.children = children;
        
        if (ignores.length > 0) {
            this._ignored = Expression.andExpression(...ignores);
        }
    }

    private bindingRelationship(soFar: RelationshipType, shorterClause: Clause, longerClause: Clause): RelationshipType {
        if (soFar === RelationshipType.equal) {
            let swapped = false;
            let shorter = shorterClause.anyBindings;
            let longer = longerClause.anyBindings;
            if (Object.entries(shorterClause.anyBindings).length > Object.entries(longerClause.anyBindings).length) {
                shorter = longerClause.anyBindings;
                longer = shorterClause.anyBindings;
                swapped = true;
            }
            
            for (const shortKey in shorter) {
                let found = false;
                const shortValue = shorter[shortKey];
                for (const longKey in longer) {
                    const longValue = longer[longKey];
                    if (shortKey === longKey && shortValue === longValue) {
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    soFar = RelationshipType.incomparable;
                }
            }
            
            if (soFar === RelationshipType.equal && Object.entries(shorter).length < Object.entries(longer).length) {
                soFar = RelationshipType.specializes;
            }
            
            soFar = this.swap(soFar, swapped);
        }
        
        return soFar;
    }
    
    private swap(soFar: RelationshipType, swapped: boolean): RelationshipType {
        let reln = soFar;
        if (swapped) {
            switch (soFar) {
                case RelationshipType.specializes:
                    reln = RelationshipType.generalizes;
                    break;
                case RelationshipType.generalizes:
                    reln = RelationshipType.specializes;
                    break;
            }
        }
        return reln;
    }

    private _relationship(expr: Expression, other: Expression, comparers: { [name: string]: PredicateComparer }): RelationshipType {
        let relationship = RelationshipType.incomparable;
        let root = expr;
        let rootOther = other;
        if (expr.type === ExpressionType.Not && other.type === ExpressionType.Not) {
            root = expr.children[0];
            rootOther = other.children[0];
        }

        let comparer: PredicateComparer;
        if (root.type === other.type) {
            comparer = comparers[root.type];
        }

        if (comparer) {
            relationship = comparer.relationship(root, rootOther);
        } else {
            relationship = expr.deepEquals(other) ? RelationshipType.equal : RelationshipType.incomparable;
        }

        return relationship;
    }
}