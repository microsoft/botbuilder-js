
/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogStateManager } from "botbuilder-dialogs";
import { ExpressionEngine, Expression } from 'botframework-expressions';

export type ExpressionDelegate<T> = (state: object) => T;
export type ExpressionPropertyValue<T> = string|Expression|ExpressionDelegate<T>;

export class ExpressionProperty<T> {
    private _value: ExpressionPropertyValue<T>;
    private _expression: Expression|undefined;

    // TODO: remove once expression contains @entity processing logic
    private _hasEntity: boolean = false;

    constructor(value: ExpressionPropertyValue<T>) {
        this._value = value;
        if (typeof value == 'string') {
            const matched =  /@(\w+)/.exec(value);
            if (matched) {
                const entity = '@' + matched[1];
                this._value = value.replace(entity, `turn.recognized.entities.${matched[1]}`);
                this._hasEntity = true;
            }
        }
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
                        //this._expression = Expression.Lambda(this._value);
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

    public evaluate(stepId: string, state: DialogStateManager): T {
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

        // Patch @entity
        if (this._hasEntity && Array.isArray(value)) {
            switch (value.length) {
                case 0:
                    // No entities found
                    return undefined;
                case 1:
                    // Unpack single entity
                    return value[0];
            }

        }

        return value;
    }

    public toString(): string {
        return this._value.toString();
    }
}

const engine = new ExpressionEngine();