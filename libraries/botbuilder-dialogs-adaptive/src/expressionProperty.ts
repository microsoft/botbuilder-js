/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExpressionEngine, Expression } from 'botframework-expressions';

export class ExpressionProperty<T> {
    private _expression: Expression;

    constructor(value: T) {
        this.setValue(value);
    }

    public value: T;

    public get expression(): string {
        return this._expression ? this._expression.toString() : undefined;
    }

    public set expression(value: string) {
        this._expression = new ExpressionEngine().parse(value);
    }

    public getValue(data: any): T {
        if (this.value) {
            return this.value;
        }

        const { value, error } = this._expression.tryEvaluate(data);
        if (error) {
            return undefined;
        }

        return <T>value;
    }

    public setValue(value: any) {
        if (typeof value == 'string') {
            this.expression = value;
        } else if (typeof value == 'object') {
            if (value.value) {
                this.value = <T>value.value;
            } else if (value.expression) {
                this.expression = value.expression.toString();
            } else {
                this.value = <T>value;
            }
        }
    }
}