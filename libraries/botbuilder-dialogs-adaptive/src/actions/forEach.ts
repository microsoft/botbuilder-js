/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogContext } from 'botbuilder-dialogs';
import { ExpressionEngine, Expression } from 'botframework-expressions';
import { ActionScope, ActionScopeResult, ActionScopeConfiguration } from './actionScope';

const INDEX = 'dialog.foreach.index';
const VALUE = 'dialog.foreach.value';

/**
 * Configuration info passed to a `ForEach` action.
 */
export interface ForEachConfiguration extends ActionScopeConfiguration {
    itemsProperty?: string;
}

export class ForEach<O extends object = {}> extends ActionScope<O> {

    public static declarativeType = 'Microsoft.Foreach';

    private _itemsPropertyExpression: Expression;

    public constructor();
    public constructor(itemsProperty: string, actions: Dialog[]);
    public constructor(itemsProperty?: string, actions?: Dialog[]) {
        super();
        if (itemsProperty) { this.itemsProperty = itemsProperty; }
        if (actions) { this.actions = actions; }
    }

    /**
     * Get property path expression to the collection of items.
     */
    public get itemsProperty(): string {
        return this._itemsPropertyExpression ? this._itemsPropertyExpression.toString() : undefined;
    }

    /**
     * Set property path expression to the collection of items.
     */
    public set itemsProperty(value: string) {
        this._itemsPropertyExpression = value ? new ExpressionEngine().parse(value) : undefined;
    }

    public getDependencies(): Dialog[] {
        return this.actions;
    }

    public configure(config: ForEachConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        dc.state.setValue(INDEX, -1);
        return await this.nextItem(dc);
    }

    protected async onBreakLoop(dc: DialogContext, actionScopeResult: ActionScopeResult): Promise<DialogTurnResult> {
        return await dc.endDialog();
    }

    protected async onContinueLoop(dc: DialogContext, actionScopeResult: ActionScopeResult): Promise<DialogTurnResult> {
        return await this.nextItem(dc);
    }

    protected async onEndOfActions(dc: DialogContext, result?: any): Promise<DialogTurnResult> {
        return await this.nextItem(dc);
    }

    protected async nextItem(dc: DialogContext): Promise<DialogTurnResult> {
        const { value } = this._itemsPropertyExpression.tryEvaluate(dc.state);
        let index = dc.state.getValue(INDEX);

        if (++index < value.length) {
            dc.state.setValue(VALUE, value[index]);
            dc.state.setValue(INDEX, index);
            return await this.beginAction(dc, 0);
        } else {
            return await dc.endDialog();
        }
    }

    protected onComputeId(): string {
        return `ForEach[${ this.itemsProperty }]`;
    }

}
