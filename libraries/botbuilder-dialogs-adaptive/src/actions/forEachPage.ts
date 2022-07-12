/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActionScope, ActionScopeConfiguration, ActionScopeResult } from './actionScope';
import { BoolProperty, IntProperty, StringProperty } from '../properties';
import { Converter, ConverterFactory, Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';

import {
    BoolExpression,
    BoolExpressionConverter,
    IntExpression,
    IntExpressionConverter,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';

const FOREACHPAGE = 'dialog.foreach.page';
const FOREACHPAGEINDEX = 'dialog.foreach.pageindex';

export interface ForEachPageConfiguration extends ActionScopeConfiguration {
    itemsProperty?: StringProperty;
    page?: StringProperty;
    pageIndex?: StringProperty;
    pageSize?: IntProperty;
    disabled?: BoolProperty;
}

/**
 * Executes a set of actions once for each page of results in an in-memory list or collection.
 *
 * @remarks
 * The list or collection at [property](#property) will be broken up into pages and stored in
 * `dialog.page` for each iteration of the loop. The size of each page is determined by [maxSize](#maxsize)
 * and defaults to a size of 10. The loop can be exited early by including either a `EndDialog` or
 * `GotoDialog` action.
 */
export class ForEachPage<O extends object = {}> extends ActionScope<O> implements ForEachPageConfiguration {
    static $kind = 'Microsoft.ForeachPage';

    constructor();

    /**
     * Initializes a new instance of the [ForeachPage](xref:botbuilder-dialogs-adaptive.ForeachPage) class.
     *
     * @param itemsProperty Optional. Expression used to compute the list that should be enumerated.
     * @param pageSize Default = `10`. Page size.
     */
    constructor(itemsProperty?: string, pageSize = 10) {
        super();
        if (itemsProperty) {
            this.itemsProperty = new StringExpression(itemsProperty);
        }
        this.pageSize = new IntExpression(pageSize);
    }

    /**
     * Expression used to compute the list that should be enumerated.
     */
    itemsProperty: StringExpression;

    /**
     * Expression used to compute the list that should be enumerated.
     */
    page: StringExpression = new StringExpression(FOREACHPAGE);

    /**
     * Expression used to compute the list that should be enumerated.
     */
    pageIndex: StringExpression = new StringExpression(FOREACHPAGEINDEX);

    /**
     * Page size, default to 10.
     */
    pageSize: IntExpression = new IntExpression(10);

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof ForEachPageConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'itemsProperty':
                return new StringExpressionConverter();
            case 'page':
                return new StringExpressionConverter();
            case 'pageIndex':
                return new StringExpressionConverter();
            case 'pageSize':
                return new IntExpressionConverter();
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

        dc.state.setValue(this.pageIndex.getValue(dc.state), 0);
        return await this.nextPage(dc);
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
        return await this.nextPage(dc);
    }

    /**
     * @protected
     * Called when returning control to this [Dialog](xref:botbuilder-dialogs.Dialog) with an [ActionScopeResult](xref:botbuilder-dialogs-adaptive.ActionScopeResult)
     * with the property `ActionCommand` set to `BreakLoop`.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _actionScopeResult [ActionScopeResult](xref:botbuilder-dialogs-adaptive.ActionScopeResult), contains the actions scope result.
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
     * @param _actionScopeResult [ActionScopeResult](xref:botbuilder-dialogs-adaptive.ActionScopeResult), contains the actions scope result.
     * @returns A `Promise` representing the asynchronous operation.
     */
    protected async onContinueLoop(
        dc: DialogContext,
        _actionScopeResult: ActionScopeResult
    ): Promise<DialogTurnResult> {
        return await this.nextPage(dc);
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `ForEachPage[${this.itemsProperty.toString()}]`;
    }

    /**
     * @private
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @returns A `Promise` representing the asynchronous operation.
     */
    private async nextPage(dc: DialogContext): Promise<DialogTurnResult> {
        let pageIndex = dc.state.getValue(this.pageIndex.getValue(dc.state), 0);
        const pageSize = this.pageSize.getValue(dc.state);
        const itemOffset = pageSize * pageIndex;

        const itemsProperty = this.itemsProperty.getValue(dc.state);
        const items: any[] = dc.state.getValue(itemsProperty, []);
        if (items.length > 0) {
            const page = this.getPage(items, itemOffset, pageSize);
            if (page && page.length > 0) {
                dc.state.setValue(this.page.getValue(dc.state), page);
                dc.state.setValue(this.pageIndex.getValue(dc.state), ++pageIndex);
                return await this.beginAction(dc, 0);
            }
        }
        return await dc.endDialog();
    }

    /**
     * @private
     */
    private getPage(list: any[] | object, index: number, pageSize: number): any[] {
        const page: any[] = [];
        const end = index + pageSize;
        if (Array.isArray(list)) {
            for (let i = index; i < list.length && i < end; i++) {
                page.push(list[i]);
            }
        } else if (typeof list === 'object') {
            let i = index;
            for (const key in list) {
                if (Object.hasOwnProperty.call(list, key)) {
                    if (i < end) {
                        page.push(list[key]);
                    }
                    i++;
                }
            }
        }
        return page;
    }
}
