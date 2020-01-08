/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogDependencies, DialogContext, Configurable } from 'botbuilder-dialogs';
import { Expression, ExpressionEngine } from 'botframework-expressions';
import { ActionScope, ActionScopeConfiguration } from './actionScope';

export interface IfConditionConfiguration extends ActionScopeConfiguration {
    /**
     * The conditional expression to evaluate.
     */
    condition?: string;

    /**
     * The actions to run if [condition](#condition) returns false.
     */
    elseActions?: Dialog[];

    disabled?: string;
}

export class IfCondition<O extends object = {}> extends Dialog<O> implements DialogDependencies, Configurable {
    public static declarativeType = 'Microsoft.IfCondition';

    public constructor();
    public constructor(condition?: string, elseActions?: Dialog[]) {
        super();
        if (condition) { this.condition = condition; }
        if (elseActions) { this.elseActions = elseActions; }
    }

    /**
     * Get conditional expression to evaluate.
     */
    public get condition(): string {
        return this._condition ? this._condition.toString() : undefined;
    }

    /**
     * Set conditional expression to evaluate.
     */
    public set condition(value: string) {
        this._condition = value ? new ExpressionEngine().parse(value) : undefined;
    }

    /**
     * The actions to run if [condition](#condition) returns true.
     */
    public actions: Dialog[] = [];

    /**
     * The actions to run if [condition](#condition) returns false.
     */
    public elseActions: Dialog[] = [];

    protected get trueScope(): ActionScope {
        if (!this._trueScope) {
            this._trueScope = new ActionScope(this.actions);
            this._trueScope.id = `True${ this.id }`;
        }
        return this._trueScope;
    }

    protected get falseScope(): ActionScope {
        if (!this._falseScope) {
            this._falseScope = new ActionScope(this.elseActions);
            this._falseScope.id = `False${ this.id }`;
        }
        return this._falseScope;
    }

    /**
     * Get an optional expression which if is true will disable this action.
     */
    public get disabled(): string {
        return this._disabled ? this._disabled.toString() : undefined;
    }

    /**
     * Set an optional expression which if is true will disable this action.
     */
    public set disabled(value: string) {
        this._disabled = value ? new ExpressionEngine().parse(value) : undefined;
    }

    private _condition: Expression;

    private _trueScope: ActionScope;

    private _falseScope: ActionScope;

    private _disabled: Expression;

    public getDependencies(): Dialog[] {
        return [].concat(this.trueScope, this.falseScope);
    }

    public configure(config: IfConditionConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
        }

        const { value, error } = this._condition.tryEvaluate(dc.state);
        const conditionResult = !error && value;
        if (conditionResult) {
            return await dc.replaceDialog(this.trueScope.id);
        } else if (!conditionResult && this.falseScope.actions && this.falseScope.actions.length > 0) {
            return await dc.replaceDialog(this.falseScope.id);
        }
        return await dc.endDialog();
    }

    protected onComputeId(): string {
        const label = this.condition ? this.condition.toString() : '';
        return `If[${ label }]`;
    }
}
