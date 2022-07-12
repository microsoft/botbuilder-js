/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActionScope, ActionScopeConfiguration, ActionScopeResult } from './actionScope';
import { BoolProperty, StringProperty } from '../properties';
import { Converter, ConverterFactory, Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { ForEachPageConfiguration } from './forEachPage';

import {
    BoolExpression,
    BoolExpressionConverter,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';

const INDEX = 'dialog.foreach.index';
const VALUE = 'dialog.foreach.value';

export interface ForEachConfiguration extends ActionScopeConfiguration {
    itemsProperty?: StringProperty;
    index?: StringProperty;
    value?: StringProperty;
    disabled?: BoolProperty;
}

/**
 * Executes a set of actions once for each item in an in-memory list or collection.
 */
export class ForEach<O extends object = {}> extends ActionScope<O> implements ForEachPageConfiguration {
    static $kind = 'Microsoft.Foreach';
    private currentIndex: number;

    constructor();

    /**
     * Initializes a new instance of the [Foreach](xref:botbuilder-dialogs-adaptive.Foreach) class.
     *
     * @param itemsProperty Property path expression to the collection of items.
     * @param actions The actions to execute.
     */
    constructor(itemsProperty: string, actions: Dialog[]);

    /**
     * Initializes a new instance of the [Foreach](xref:botbuilder-dialogs-adaptive.Foreach) class.
     *
     * @param itemsProperty Optional. Property path expression to the collection of items.
     * @param actions Optional. The actions to execute.
     */
    constructor(itemsProperty?: string, actions?: Dialog[]) {
        super();
        if (itemsProperty) {
            this.itemsProperty = new StringExpression(itemsProperty);
        }
        if (actions) {
            this.actions = actions;
        }
    }

    /**
     * Property path expression to the collection of items.
     */
    itemsProperty: StringExpression;

    /**
     * Property path expression to the item index.
     */
    index: StringExpression = new StringExpression(INDEX);

    /**
     * Property path expression to the item value.
     */
    value: StringExpression = new StringExpression(VALUE);

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof ForEachConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'itemsProperty':
                return new StringExpressionConverter();
            case 'index':
                return new StringExpressionConverter();
            case 'value':
                return new StringExpressionConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Gets the child [Dialog](xref:botbuilder-dialogs.Dialog) dependencies so they can be added to the containers [Dialog](xref:botbuilder-dialogs.Dialog) set.
     *
     * @returns The child [Dialog](xref:botbuilder-dialogs.Dialog) dependencies.
     */
    getDependencies(): Dialog[] {
        return this.actions;
    }

    /**
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, _options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }
        this.currentIndex = -1;
        return await this.nextItem(dc);
    }

    /**
     * @protected
     * Called when returning control to this [Dialog](xref:botbuilder-dialogs.Dialog) with an [ActionScopeResult](xref:botbuilder-dialogs-adaptive.ActionScopeResult)
     * with the property `ActionCommand` set to `BreakLoop`.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _actionScopeResult The [ActionScopeResult](xref:botbuilder-dialogs-adaptive.ActionScopeResult).
     * @returns A `Promise` representing the asynchronous operation.
     */
    protected async onBreakLoop(dc: DialogContext, _actionScopeResult: ActionScopeResult): Promise<DialogTurnResult> {
        return await dc.endDialog();
    }

    /**
     * @protected
     * Called when returning control to this [Dialog](xref:botbuilder-dialogs.Dialog) with an [ActionScopeResult](xref:botbuilder-dialogs-adaptive.ActionScopeResult)
     * with the property `ActionCommand` set to `ContinueLoop`.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _actionScopeResult The [ActionScopeResult](xref:botbuilder-dialogs-adaptive.ActionScopeResult).
     * @returns A `Promise` representing the asynchronous operation.
     */
    protected async onContinueLoop(
        dc: DialogContext,
        _actionScopeResult: ActionScopeResult
    ): Promise<DialogTurnResult> {
        return await this.nextItem(dc);
    }

    /**
     * @protected
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) continues to the next action.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _result Optional. Value returned from the dialog that was called. The type
     * of the value returned is dependent on the child dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    protected async onEndOfActions(dc: DialogContext, _result?: any): Promise<DialogTurnResult> {
        return await this.nextItem(dc);
    }

    /**
     * @protected
     * Calls the next item in the stack.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @returns A `Promise` representing the asynchronous operation.
     */
    protected async nextItem(dc: DialogContext): Promise<DialogTurnResult> {
        const itemsProperty = this.itemsProperty.getValue(dc.state);
        const items = this.convertToList(dc.state.getValue(itemsProperty, []));

        if (++this.currentIndex < items.length) {
            dc.state.setValue(this.value.getValue(dc.state), items[this.currentIndex].value);
            dc.state.setValue(this.index.getValue(dc.state), items[this.currentIndex].index);
            return await this.beginAction(dc, 0);
        } else {
            return await dc.endDialog();
        }
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `ForEach[${this.itemsProperty.toString()}]`;
    }

    private convertToList(value: unknown) {
        const result: { index: string | number; value: unknown }[] = [];
        if (Array.isArray(value)) {
            value.forEach((item, index) => result.push({ index: index, value: item }));
        } else if (typeof value === 'object') {
            Object.entries(value).forEach(([key, value]) => result.push({ index: key, value: value }));
        }

        return result;
    }
}
