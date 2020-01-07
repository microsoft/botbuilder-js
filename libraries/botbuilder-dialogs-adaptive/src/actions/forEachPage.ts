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

const FOREACHPAGE = 'dialog.foreach.page';
const FOREACHPAGEINDEX = 'dialog.foreach.pageindex';

/**
 * Configuration info passed to a `ForEachPage` action.
 */
export interface ForEachPageConfiguration extends ActionScopeConfiguration {
    itemsProperty?: string;
    pageSize?: number;
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
export class ForEachPage<O extends object = {}> extends ActionScope<O> {

    public static declarativeType = 'Microsoft.ForeachPage';

    private _itemsPropertyExpression: Expression;

    /**
     * Get expression used to compute the list that should be enumerated.
     */
    public get itemsProperty(): string {
        return this._itemsPropertyExpression ? this._itemsPropertyExpression.toString() : undefined;
    }

    /**
     * Set expression used to compute the list that should be enumerated.
     */
    public set itemsProperty(value: string) {
        this._itemsPropertyExpression = value ? new ExpressionEngine().parse(value) : undefined;
    }

    public pageSize = 10;

    public getDependencies(): Dialog[] {
        return this.actions;
    }

    public configure(config: ForEachPageConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        return await this.nextPage(dc);
    }

    protected async onEndOfActions(dc: DialogContext, result?: any): Promise<DialogTurnResult> {
        return await this.nextPage(dc);
    }

    protected async onBreakLoop(dc: DialogContext, actionScopeResult: ActionScopeResult): Promise<DialogTurnResult> {
        return await dc.endDialog();
    }

    protected async onContinueLoop(dc: DialogContext, actionScopeResult: ActionScopeResult): Promise<DialogTurnResult> {
        return await this.nextPage(dc);
    }

    protected onComputeId(): string {
        return `ForEachPage[${ this.itemsProperty }]`;
    }

    private async nextPage(dc: DialogContext): Promise<DialogTurnResult> {
        let pageIndex = dc.state.getValue(FOREACHPAGEINDEX, 0);
        const pageSize = this.pageSize;
        const itemOffset = pageSize * pageIndex;

        const { value, error } = this._itemsPropertyExpression.tryEvaluate(dc.state);
        if (!error) {
            const page = this.getPage(value, itemOffset, pageSize);
            if (page && page.length > 0) {
                dc.state.setValue(FOREACHPAGE, page);
                dc.state.setValue(FOREACHPAGEINDEX, ++pageIndex);
                return await this.beginAction(dc, 0);
            }
        }

        return await dc.endDialog();
    }

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
                if (list.hasOwnProperty(key)) {
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
