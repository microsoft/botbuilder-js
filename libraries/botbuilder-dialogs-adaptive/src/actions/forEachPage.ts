/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    BoolExpression,
    BoolExpressionConverter,
    Expression,
    IntExpression,
    IntExpressionConverter,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';
import { Converter, ConverterFactory, Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { ActionScope, ActionScopeConfiguration, ActionScopeResult } from './actionScope';

const FOREACHPAGE = 'dialog.foreach.page';
const FOREACHPAGEINDEX = 'dialog.foreach.pageindex';

export interface ForEachPageConfiguration extends ActionScopeConfiguration {
    itemsProperty?: string | Expression | StringExpression;
    page?: string | Expression | StringExpression;
    pageIndex?: string | Expression | StringExpression;
    pageSize?: number | string | Expression | IntExpression;
    disabled?: boolean | string | Expression | BoolExpression;
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
    public static $kind = 'Microsoft.ForeachPage';

    public constructor();
    public constructor(itemsProperty?: string, pageSize = 10) {
        super();
        if (itemsProperty) {
            this.itemsProperty = new StringExpression(itemsProperty);
        }
        this.pageSize = new IntExpression(pageSize);
    }

    /**
     * Expression used to compute the list that should be enumerated.
     */
    public itemsProperty: StringExpression;

    /**
     * Expression used to compute the list that should be enumerated.
     */
    public page: StringExpression = new StringExpression(FOREACHPAGE);

    /**
     * Expression used to compute the list that should be enumerated.
     */
    public pageIndex: StringExpression = new StringExpression(FOREACHPAGEINDEX);

    /**
     * Page size, default to 10.
     */
    public pageSize: IntExpression = new IntExpression(10);

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public getConverter(property: keyof ForEachPageConfiguration): Converter | ConverterFactory {
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

    public getDependencies(): Dialog[] {
        return this.actions;
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        dc.state.setValue(this.pageIndex.getValue(dc.state), 0);
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
        return `ForEachPage[${this.itemsProperty.toString()}]`;
    }

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
