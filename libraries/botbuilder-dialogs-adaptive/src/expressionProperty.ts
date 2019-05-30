
/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContextVisibleState } from "botbuilder-dialogs";
import { ExpressionEngine } from 'botbuilder-expression-parser';
import { Expression } from 'botbuilder-expression';

export type ExpressionDelegate<T> = (state: DialogContextVisibleState) => T;
export type ExpressionPropertyValue<T> = string|Expression|ExpressionDelegate<T>;

export class ExpressionProperty<T> {
    private _value: ExpressionPropertyValue<T>;
    private _expression: Expression|undefined;

    constructor(value: ExpressionPropertyValue<T>) {
        this._value = value;
    }

    public get expression(): Expression {
        if (this._expression == undefined) {
            // Parse expression
            if (this._value) {
                switch (typeof this._value) {
                    case 'string':
                        this._expression = engine.parse(this._value);
                        break; 
                    case 'function':
                        this._expression = Expression.Lambda(this._value);
                        break;
                    default:
                        this._expression = this._value;
                        break;
                }
            } else {
                throw new Error(`Attempt to parse a missing expression.`)
            }
        }

        return this._expression;
    }

    public evaluate(stepId: string, state: DialogContextVisibleState): T {
        // Parse expression
        let expression: Expression;
        try {
            expression = this.expression;
        } catch (err) {
            throw new Error(`${stepId}: Error parsing expression - ${err.toString()}`);
        }

        // Evaluate expression
        const { value, error } = expression.tryEvaluate(state);
        if (error) { throw new Error(`${stepId}: Error evaluating expression - ${error}`) }
        return value;
    }

    public toString(): string {
        return this._value.toString();
    }
}

const engine = new ExpressionEngine();