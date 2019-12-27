/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogContext } from 'botbuilder-dialogs';
import { ExpressionEngine } from 'botframework-expressions';
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

    public constructor();
    public constructor(itemsProperty: string, actions: Dialog[]);
    public constructor(itemsProperty?: string, actions?: Dialog[]) {
        super();
        if (itemsProperty) { this.itemsProperty = itemsProperty; }
        if (actions) { this.actions = actions; }
    }

    /**
     * Property path expression to the collection of items.
     */
    public itemsProperty: string;

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
        const itemsProperty = new ExpressionEngine().parse(this.itemsProperty);
        const { value } = itemsProperty.tryEvaluate(dc.state);
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
