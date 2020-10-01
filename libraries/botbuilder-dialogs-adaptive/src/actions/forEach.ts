/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogContext } from 'botbuilder-dialogs';
import { ActionScope, ActionScopeResult } from './actionScope';
import { StringExpression, BoolExpression } from 'adaptive-expressions';

const INDEX = 'dialog.foreach.index';
const VALUE = 'dialog.foreach.value';

/**
 * Executes a set of actions once for each item in an in-memory list or collection.
 */
export class ForEach<O extends object = {}> extends ActionScope<O> {
    public constructor();

    /**
     * Initializes a new instance of the `Foreach` class.
     * @param itemsProperty Property path expression to the collection of items.
     * @param actions The actions to execute.
     */
    public constructor(itemsProperty: string, actions: Dialog[]);

    /**
     * Initializes a new instance of the `Foreach` class.
     * @param itemsProperty Optional. Property path expression to the collection of items.
     * @param actions Optional. The actions to execute.
     */
    public constructor(itemsProperty?: string, actions?: Dialog[]) {
        super();
        if (itemsProperty) { this.itemsProperty = new StringExpression(itemsProperty); }
        if (actions) { this.actions = actions; }
    }

    /**
     * Property path expression to the collection of items.
     */
    public itemsProperty: StringExpression;

    /**
     * Property path expression to the item index.
     */
    public index: StringExpression = new StringExpression(INDEX);

    /**
     * Property path expression to the item value.
     */
    public value: StringExpression = new StringExpression(VALUE);

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    /**
     * Gets the child dialog dependencies so they can be added to the containers dialog set.
     * @returns The child dialog dependencies.
     */
    public getDependencies(): Dialog[] {
        return this.actions;
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
        dc.state.setValue(this.index.getValue(dc.state), -1);
        return await this.nextItem(dc);
    }

    /**
     * @protected
     * Called when returning control to this dialog with an `ActionScopeResult` 
     * with the property `ActionCommand` set to `BreakLoop`.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param actionScopeResult Contains the actions scope result.
     * @returns A `Promise` representing the asynchronous operation.
     */
    protected async onBreakLoop(dc: DialogContext, actionScopeResult: ActionScopeResult): Promise<DialogTurnResult> {
        return await dc.endDialog();
    }

    /**
     * @protected
     * Called when returning control to this dialog with an `ActionScopeResult` 
     * with the property `ActionCommand` set to `ContinueLoop`.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param actionScopeResult Contains the actions scope result.
     * @returns A `Promise` representing the asynchronous operation.
     */
    protected async onContinueLoop(dc: DialogContext, actionScopeResult: ActionScopeResult): Promise<DialogTurnResult> {
        return await this.nextItem(dc);
    }

    /**
     * @protected
     * Called when the dialog continues to the next action.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param result Optional. Value returned from the dialog that was called. The type 
     * of the value returned is dependent on the child dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    protected async onEndOfActions(dc: DialogContext, result?: any): Promise<DialogTurnResult> {
        return await this.nextItem(dc);
    }

    /**
     * @protected
     * Calls the next item in the stack.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @returns A `Promise` representing the asynchronous operation.
     */
    protected async nextItem(dc: DialogContext): Promise<DialogTurnResult> {
        const itemsProperty = this.itemsProperty.getValue(dc.state);
        const items: any[] = dc.state.getValue(itemsProperty, []);
        let index = dc.state.getValue(this.index.getValue(dc.state));

        if (++index < items.length) {
            dc.state.setValue(this.value.getValue(dc.state), items[index]);
            dc.state.setValue(this.index.getValue(dc.state), index);
            return await this.beginAction(dc, 0);
        } else {
            return await dc.endDialog();
        }
    }

    /**
     * @protected
     * Builds the compute Id for the dialog.
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `ForEach[${ this.itemsProperty.toString() }]`;
    }

}
