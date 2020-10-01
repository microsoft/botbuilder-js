/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { StringUtils } from 'botbuilder-core';
import { DialogTurnResult, Dialog, DialogDependencies, DialogContext } from 'botbuilder-dialogs';
import { ActionScope } from './actionScope';
import { BoolExpression } from 'adaptive-expressions';

/**
 * Conditional branch.
 */
export class IfCondition<O extends object = {}> extends Dialog<O> implements DialogDependencies {
    public constructor();

    /**
     * Initializes a new instance of the `IfCondition` class.
     * @param condition Optional. Conditional expression to evaluate.
     * @param elseActions Optional. The actions to run if [condition](#condition) returns false.
     */
    public constructor(condition?: string, elseActions?: Dialog[]) {
        super();
        if (condition) { this.condition = new BoolExpression(condition); }
        if (elseActions) { this.elseActions = elseActions; }
    }

    /**
     * Conditional expression to evaluate.
     */
    public condition: BoolExpression;

    /**
     * The actions to run if [condition](#condition) returns true.
     */
    public actions: Dialog[] = [];

    /**
     * The actions to run if [condition](#condition) returns false.
     */
    public elseActions: Dialog[] = [];

    /**
     * @protected
     * Gets the true scope.
     * @returns An `ActionScope` with the action scope.
     */
    protected get trueScope(): ActionScope {
        if (!this._trueScope) {
            this._trueScope = new ActionScope(this.actions);
            this._trueScope.id = `True${ this.id }`;
        }
        return this._trueScope;
    }

    /**
     * @protected
     * Gets the false scope.
     * @returns An `ActionScope` with the action scope.
     */
    protected get falseScope(): ActionScope {
        if (!this._falseScope) {
            this._falseScope = new ActionScope(this.elseActions);
            this._falseScope.id = `False${ this.id }`;
        }
        return this._falseScope;
    }

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    private _trueScope: ActionScope;

    private _falseScope: ActionScope;

    /**
     * Gets the child dialog dependencies so they can be added to the containers dialog set.
     * @returns The child dialog dependencies.
     */
    public getDependencies(): Dialog[] {
        return [].concat(this.trueScope, this.falseScope);
    }

    /**
     * Starts a new dialog and pushes it onto the dialog stack.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        const conditionResult = this.condition.getValue(dc.state);
        if (conditionResult) {
            return await dc.replaceDialog(this.trueScope.id);
        } else if (!conditionResult && this.falseScope.actions && this.falseScope.actions.length > 0) {
            return await dc.replaceDialog(this.falseScope.id);
        }
        return await dc.endDialog();
    }

    /**
     * @protected
     * Builds the compute Id for the dialog.
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        const label = this.condition ? this.condition.toString() : '';
        const idList = this.actions.map((action: Dialog): string => action.id);
        return `If[${ label }|${ StringUtils.ellipsis(idList.join(','), 50) }]`;
    }
}
