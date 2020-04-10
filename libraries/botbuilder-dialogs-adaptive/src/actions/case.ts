/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from 'botbuilder-dialogs';
import { Expression, Constant } from 'adaptive-expressions';
import { Converter, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { ActionScope } from './actionScope';

export class Case extends ActionScope {
    public constructor(value?: string, actions: Dialog[] = []) {
        super(actions);
        this.value = value;
    }

    /**
     * Gets or sets value expression to be compared against condition.
     */
    public value: string;

    /**
     * Creates an expression that returns the value in its primitive type. Still
     * assumes that switch case values are compile time constants and not expressions
     * that can be evaluated against state.
     */
    public createValueExpression(): Expression {
        let value = parseInt(this.value);
        if (!isNaN(value)) {
            return new Constant(value);
        }

        value = parseFloat(this.value);
        if (!isNaN(value)) {
            return new Constant(value);
        }

        if (this.value === 'true' || this.value === 'True') {
            return new Constant(true);
        }

        if (this.value === 'false' || this.value === 'False') {
            return new Constant(false);
        }

        return new Constant(this.value);
    }
}

export class CaseConverter implements Converter {
    private _resourceExplorer: ResourceExplorer;

    public constructor(resourceExplorer: ResourceExplorer) {
        this._resourceExplorer = resourceExplorer;
    }
    public convert(config: { value: string; actions: Dialog[] }): Case {
        return new Case(config.value, config.actions);
    }
}
